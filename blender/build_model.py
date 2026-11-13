"""
Genera public/models/pc-completa.glb: una PC de escritorio genérica y estilizada.

Uso:
    npm run model:build      # exporta el .glb y renderiza la imagen de respaldo
    # equivale a:
    blender --background --factory-startup --python blender/build_model.py

Convenciones (ver docs/MVP.md, sección 8):
- Unidades en metros. Todos los objetos tienen transformaciones aplicadas
  (posición 0, rotación 0, escala 1): la geometría se construye directamente
  en coordenadas del mundo.
- Cada pieza clicable es un nodo cuyo nombre coincide con `modelNode`
  en src/data/components.json. Los detalles de una pieza son hijos de ese nodo.
- Piezas genéricas, sin logos ni marcas.

Ejes de Blender usados aquí: X = ancho (el lado abierto del gabinete está en -X),
Y = profundidad (frente en -Y, parte trasera en +Y), Z = alto.
El exportador glTF convierte a Y arriba.

Dimensiones (en milímetros):
- Placa madre ATX: 305 x 244. Fuente: especificación ATX (ATX Specification 2.2, Intel).
- Módulo de memoria DIMM: 133,35 de largo. Fuente: estándar JEDEC para DIMM DDR4/DDR5.
  La altura y el disipador son aproximados.
- SSD M.2 2280: 22 x 80. Fuente: el código de tamaño de la especificación M.2 (PCI-SIG).
- Fuente de poder ATX: 150 x 86 x 140. Fuente: ATX12V Power Supply Design Guide (Intel).
- Gabinete, tarjeta gráfica, procesador, disipadores y ventiladores: APROXIMADOS,
  elegidos solo para que la escena se vea proporcionada.
"""

import math
import os
import sys

import bmesh
import bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(ROOT, "public", "models", "pc-completa.glb")
# Imagen de respaldo para navegadores sin WebGL (se renderiza con la misma escena).
FALLBACK_IMAGE = os.path.join(ROOT, "public", "images", "pc-respaldo.webp")

MM = 0.001

# ---------------------------------------------------------------------------
# Materiales
# ---------------------------------------------------------------------------

PALETTE = {
    "gabinete": ((0.165, 0.176, 0.204), 0.3, 0.55),
    "gabinete_frente": ((0.120, 0.128, 0.150), 0.2, 0.7),
    "pcb": ((0.090, 0.165, 0.130), 0.0, 0.6),
    "slot": ((0.050, 0.052, 0.058), 0.0, 0.5),
    "metal": ((0.62, 0.65, 0.69), 0.9, 0.32),
    "metal_oscuro": ((0.22, 0.23, 0.26), 0.85, 0.4),
    "chip": ((0.035, 0.036, 0.040), 0.1, 0.45),
    "acento": ((0.043, 0.361, 0.678), 0.2, 0.35),
    "plastico": ((0.10, 0.105, 0.115), 0.0, 0.6),
    "ventilador": ((0.18, 0.19, 0.21), 0.0, 0.55),
    "sustrato_cpu": ((0.10, 0.30, 0.18), 0.0, 0.5),
}

_materials = {}


def material(name):
    if name not in _materials:
        color, metallic, roughness = PALETTE[name]
        mat = bpy.data.materials.new(name)
        if mat.node_tree is None:  # Blender < 5 crea materiales sin nodos
            mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        _materials[name] = mat
    return _materials[name]


# ---------------------------------------------------------------------------
# Geometría
# ---------------------------------------------------------------------------


def _finish(name, bm, mat, parent, bevel_mm):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = True
    mesh.materials.append(material(mat))

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent

    if bevel_mm > 0:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel_mm * MM
        mod.segments = 3
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(40)
        mod.harden_normals = True
    return obj


def box(name, x, y, z, mat, parent=None, bevel=None):
    """Caja definida por rangos (min, max) en mm para cada eje."""
    size = [abs(b - a) for a, b in (x, y, z)]
    center = [(a + b) / 2 for a, b in (x, y, z)]
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = center[0] * MM + v.co.x * size[0] * MM
        v.co.y = center[1] * MM + v.co.y * size[1] * MM
        v.co.z = center[2] * MM + v.co.z * size[2] * MM
    if bevel is None:
        bevel = min(min(size) * 0.25, 3.0)
    return _finish(name, bm, mat, parent, bevel)


def cylinder(name, center, radius, depth, axis, mat, parent=None, segments=32, bevel=None):
    """Cilindro con centro y medidas en mm, orientado según `axis` ('x', 'y' o 'z')."""
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        segments=segments,
        radius1=radius * MM,
        radius2=radius * MM,
        depth=depth * MM,
    )
    for v in bm.verts:
        x, y, z = v.co
        if axis == "x":
            x, y, z = z, y, -x
        elif axis == "y":
            x, y, z = x, z, -y
        v.co.x = center[0] * MM + x
        v.co.y = center[1] * MM + y
        v.co.z = center[2] * MM + z
    if bevel is None:
        bevel = min(depth * 0.25, 1.5)
    return _finish(name, bm, mat, parent, bevel)


def group(name, parent=None):
    empty = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(empty)
    if parent is not None:
        empty.parent = parent
    return empty


def fan(prefix, center, axis, parent, size=120, thickness=25):
    """Ventilador genérico: marco cuadrado, aspas (disco) y centro."""
    cx, cy, cz = center
    h = size / 2
    t = thickness / 2
    if axis == "y":
        frame = box(f"{prefix}_marco", (cx - h, cx + h), (cy - t, cy + t), (cz - h, cz + h),
                    "plastico", parent)
        offset = (0, -t - 0.5, 0)
    elif axis == "z":
        frame = box(f"{prefix}_marco", (cx - h, cx + h), (cy - h, cy + h), (cz - t, cz + t),
                    "plastico", parent)
        offset = (0, 0, -t - 0.5)
    else:
        frame = box(f"{prefix}_marco", (cx - t, cx + t), (cy - h, cy + h), (cz - h, cz + h),
                    "plastico", parent)
        offset = (-t - 0.5, 0, 0)
    # Aspas y centro en ambas caras, para que se vean desde adentro y desde afuera.
    for side, sign in (("a", 1), ("b", -1)):
        face = (cx + offset[0] * sign, cy + offset[1] * sign, cz + offset[2] * sign)
        cylinder(f"{prefix}_aspas_{side}", face, h * 0.88, 2, axis, "ventilador", parent,
                 segments=48)
        hub = (cx + offset[0] * sign * 1.15, cy + offset[1] * sign * 1.15,
               cz + offset[2] * sign * 1.15)
        cylinder(f"{prefix}_centro_{side}", hub, h * 0.3, 3, axis, "plastico", parent)
    return frame


# ---------------------------------------------------------------------------
# Escena
# ---------------------------------------------------------------------------


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for item in list(block):
            block.remove(item)


def build_case():
    """Gabinete torre (aproximado): 210 x 450 x 460 mm, lado izquierdo abierto."""
    g = group("GABINETE")
    box("GABINETE_lateral", (100, 105), (-225, 225), (10, 460), "gabinete", g)
    box("GABINETE_techo", (-105, 100), (-225, 225), (455, 460), "gabinete", g)
    box("GABINETE_piso", (-105, 100), (-225, 225), (10, 15), "gabinete", g)
    box("GABINETE_trasera", (-105, 100), (220, 225), (15, 455), "gabinete", g)
    box("GABINETE_frente", (-107, 107), (-232, -212), (8, 462), "gabinete_frente", g, bevel=4)
    # Franja decorativa vertical en el frente
    box("GABINETE_frente_franja", (-4, 4), (-234, -231), (60, 420), "acento", g, bevel=1)
    # Botón de encendido
    cylinder("GABINETE_boton", (0, -233, 440), 6, 3, "y", "metal", g)
    # Patas
    for i, (x, y) in enumerate([(-85, -195), (85, -195), (-85, 195), (85, 195)]):
        box(f"GABINETE_pata_{i + 1}", (x - 15, x + 15), (y - 15, y + 15), (0, 10), "plastico", g)
    # Tapas de las ranuras de expansión (trasera)
    for i in range(4):
        z = 270 - i * 22
        box(f"GABINETE_tapa_ranura_{i + 1}", (-20, 92), (218, 220), (z - 18, z), "metal_oscuro",
            g, bevel=0.5)
    # Pasacables de goma en la bandeja de la placa madre
    for i, z in enumerate([190, 300, 400]):
        box(f"GABINETE_pasacables_{i + 1}", (97, 100), (-56, -40), (z - 35, z + 35), "plastico",
            g, bevel=1.5)
    fan("GABINETE_ventilador_frontal_1", (0, -196, 150), "y", g)
    fan("GABINETE_ventilador_frontal_2", (0, -196, 290), "y", g)
    fan("GABINETE_ventilador_trasero", (5, 207, 370), "y", g)
    return g


def build_motherboard():
    """Placa madre ATX: 305 x 244 mm (estándar ATX)."""
    pcb = box("PLACA_MADRE", (92, 94), (-30, 214), (140, 445), "pcb", bevel=0.8)
    # Panel trasero de conectores
    box("PLACA_MADRE_panel_io", (70, 92), (188, 214), (390, 440), "metal_oscuro", pcb)
    # Disipadores de los reguladores de voltaje (VRM)
    box("PLACA_MADRE_vrm_superior", (76, 92), (60, 170), (408, 430), "metal_oscuro", pcb)
    box("PLACA_MADRE_vrm_lateral", (76, 92), (172, 188), (320, 405), "metal_oscuro", pcb)
    # Zócalo del procesador
    box("PLACA_MADRE_zocalo", (88, 92), (85, 145), (325, 395), "metal", pcb, bevel=1)
    # Ranuras de memoria
    for i, y in enumerate([40, 52, 64, 76]):
        box(f"PLACA_MADRE_ranura_ram_{i + 1}", (87, 92), (y - 3, y + 3), (288, 435), "slot", pcb,
            bevel=0.8)
    # Ranuras PCIe
    box("PLACA_MADRE_pcie_1", (87, 92), (100, 190), (268, 276), "slot", pcb, bevel=0.8)
    box("PLACA_MADRE_pcie_2", (87, 92), (100, 190), (178, 186), "slot", pcb, bevel=0.8)
    # Disipador del chipset
    box("PLACA_MADRE_chipset", (84, 92), (15, 60), (185, 228), "metal_oscuro", pcb)
    box("PLACA_MADRE_chipset_acento", (83, 84), (25, 50), (200, 213), "acento", pcb, bevel=0.3)
    # Conector de alimentación de 24 pines
    box("PLACA_MADRE_conector_24p", (82, 92), (-27, -12), (320, 375), "plastico", pcb, bevel=1)
    # Conector de alimentación del procesador (8 pines)
    box("PLACA_MADRE_conector_cpu", (82, 92), (150, 170), (433, 443), "plastico", pcb, bevel=1)
    return pcb


def build_cpu():
    """Procesador genérico con disipador integrado (IHS). Medidas aproximadas."""
    cpu = box("CPU", (86, 88), (95, 135), (340, 380), "sustrato_cpu", bevel=0.5)
    box("CPU_ihs", (83, 86), (99, 131), (344, 376), "metal", cpu, bevel=1)
    return cpu


def build_ram():
    """Dos módulos DIMM de 133,35 mm (JEDEC). Altura y disipador aproximados."""
    ram = group("RAM_1")
    for i, y in enumerate([52, 76]):
        z0, z1 = 295.0, 295.0 + 133.35
        box(f"RAM_1_modulo_{i + 1}", (58, 88), (y - 3.5, y + 3.5), (z0, z1), "metal_oscuro", ram,
            bevel=1.2)
        box(f"RAM_1_modulo_{i + 1}_acento", (56, 58), (y - 2.5, y + 2.5), (z0 + 6, z1 - 6),
            "acento", ram, bevel=0.5)
    return ram


def build_gpu():
    """Tarjeta gráfica genérica de dos ranuras. Medidas aproximadas."""
    shroud = box("GPU", (-22, 87), (-60, 212), (228, 266), "metal_oscuro", bevel=3)
    gpu = shroud
    # Placa trasera
    box("GPU_placa_trasera", (-22, 87), (-58, 210), (266, 270), "gabinete", gpu, bevel=1)
    # Franja de acento en el borde visible
    box("GPU_acento", (-24, -22), (-40, 190), (240, 254), "acento", gpu, bevel=0.6)
    # Ventiladores en la cara inferior
    for i, y in enumerate([15, 125]):
        cylinder(f"GPU_ventilador_{i + 1}_aspas", (32, y, 226.5), 46, 3, "z", "ventilador", gpu,
                 segments=48)
        cylinder(f"GPU_ventilador_{i + 1}_centro", (32, y, 224.5), 14, 2, "z", "plastico", gpu)
    # Soporte metálico trasero
    box("GPU_soporte", (-20, 92), (212, 216), (225, 272), "metal", gpu, bevel=0.5)
    # Conector de alimentación
    box("GPU_conector", (-14, 6), (120, 150), (270, 278), "plastico", gpu, bevel=1)
    return gpu


def build_psu():
    """Fuente de poder ATX: 150 x 86 x 140 mm (ATX12V Design Guide)."""
    psu = box("FUENTE", (-75, 75), (80, 220), (15, 101), "gabinete_frente", bevel=3)
    # Rejilla del ventilador (cara superior)
    cylinder("FUENTE_rejilla", (0, 150, 102), 55, 2, "z", "metal_oscuro", psu, segments=48)
    cylinder("FUENTE_centro", (0, 150, 103.5), 16, 1.5, "z", "plastico", psu)
    box("FUENTE_franja", (-76.5, -75), (95, 205), (52, 58), "acento", psu, bevel=0.4)
    return psu


def build_storage():
    """SSD M.2 2280: 22 x 80 mm (especificación M.2)."""
    ssd = box("ALMACENAMIENTO", (89.6, 92), (80, 160), (195, 217), "pcb", bevel=0.4)
    box("ALMACENAMIENTO_controlador", (88.4, 89.6), (88, 102), (199, 213), "chip", ssd, bevel=0.3)
    for i, y in enumerate([108, 128]):
        box(f"ALMACENAMIENTO_memoria_{i + 1}", (88.4, 89.6), (y, y + 16), (199, 213), "chip", ssd,
            bevel=0.3)
    return ssd


def export(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_materials="EXPORT",
    )


def render_fallback(path):
    """Renderiza la vista inicial del visor (lado abierto, desde el frente) con fondo transparente."""
    from mathutils import Vector

    scene = bpy.context.scene
    target = Vector((0.0, 0.0, 0.235))
    # Misma dirección que la cámara inicial del visor (src/viewer/Viewer.tsx), en ejes de Blender.
    direction = Vector((-0.8, -0.6, 0.45)).normalized()
    radius = 0.35  # radio aproximado de la esfera que envuelve el gabinete
    fov = math.radians(40)

    cam_data = bpy.data.cameras.new("CamaraRespaldo")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.angle_y = fov
    cam = bpy.data.objects.new("CamaraRespaldo", cam_data)
    scene.collection.objects.link(cam)
    cam.location = target + direction * (radius / math.sin(fov / 2))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam

    def sun(name, rotation, strength):
        data = bpy.data.lights.new(name, "SUN")
        data.energy = strength
        obj = bpy.data.objects.new(name, data)
        obj.rotation_euler = [math.radians(a) for a in rotation]
        scene.collection.objects.link(obj)

    sun("LuzPrincipal", (50, 0, -60), 3.5)
    sun("LuzRelleno", (60, 0, 200), 1.0)

    world = bpy.data.worlds.new("Mundo")
    if world.node_tree is None:  # Blender < 5
        world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.9, 0.92, 0.95, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.3
    scene.world = world

    scene.render.engine = "BLENDER_EEVEE"
    scene.render.film_transparent = True
    scene.render.resolution_x = 960
    scene.render.resolution_y = 800
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.quality = 85
    scene.view_settings.view_transform = "Standard"
    scene.render.filepath = path
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.render.render(write_still=True)

    # La cámara y las luces solo sirven para el render: no deben quedar en el .glb.
    for obj in (cam, *[o for o in scene.objects if o.type == "LIGHT"]):
        bpy.data.objects.remove(obj, do_unlink=True)


def main():
    clear_scene()
    build_case()
    build_motherboard()
    build_cpu()
    build_ram()
    build_gpu()
    build_psu()
    build_storage()

    out = OUTPUT
    if "--" in sys.argv:
        args = [a for a in sys.argv[sys.argv.index("--") + 1:] if not a.startswith("--")]
        if args:
            out = os.path.abspath(args[0])
    export(out)
    size_kb = os.path.getsize(out) / 1024
    print(f"[build_model] Exportado {out} ({size_kb:.0f} KB)")

    if "--sin-imagen" not in sys.argv:
        render_fallback(FALLBACK_IMAGE)
        size_kb = os.path.getsize(FALLBACK_IMAGE) / 1024
        print(f"[build_model] Imagen de respaldo {FALLBACK_IMAGE} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
