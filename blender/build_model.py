"""
Genera public/models/pc-completa.glb: una PC de escritorio genérica con el interior visible.

Uso:
    npm run model:build      # exporta el .glb y renderiza la imagen de respaldo
    # equivale a:
    blender --background --factory-startup --python blender/build_model.py
    # Opciones (después de "--"):
    #   <ruta.glb>                 exporta a otra ruta
    #   --sin-imagen               no renderiza la imagen de respaldo
    #   --vista-previa=<carpeta>   renderiza vistas de control (armada y explotada) en esa carpeta

Convenciones (ver docs/MVP.md, sección 8):
- Unidades en metros. Los objetos no tienen transformaciones: la geometría se
  construye directamente en coordenadas del mundo.
- Cada pieza clicable es un nodo vacío cuyo nombre coincide con `modelNode` en
  src/data/components.json. Su geometría cuelga de él, con una malla por material
  (pocas mallas = pocas llamadas de dibujo en el navegador).
- El grupo CABLES no es clicable; el visor lo oculta en la vista explotada.
- Piezas genéricas, sin logos ni marcas.

Ejes de Blender usados aquí: X = ancho (el lado abierto del gabinete está en -X),
Y = profundidad (frente en -Y, parte trasera en +Y), Z = alto.
El exportador glTF convierte a Y arriba.

Dimensiones (en milímetros):
- Placa madre ATX: 305 x 244. Fuente: ATX Specification 2.2 (Intel).
- Módulo DIMM: 133,35 de largo y 1,27 de espesor de PCB. Fuente: estándar JEDEC para DIMM
  DDR4/DDR5. La altura (31) y los chips son aproximados.
- Ranura PCIe x16: 89 de largo. Fuente: PCI Express Card Electromechanical Specification
  (PCI-SIG). Alto y ancho de la ranura, aproximados.
- SSD M.2 2280: 22 x 80. Fuente: el código de tamaño de la especificación M.2 (PCI-SIG).
- Pila CR2032: 20 de diámetro y 3,2 de espesor. Fuente: norma IEC 60086.
- Fuente de poder ATX: 150 x 86 x 140. Fuente: ATX12V Power Supply Design Guide (Intel).
- Paso entre ranuras de expansión: 20,32. Fuente: ATX Specification 2.2.
- Ventiladores de 120 y 140 x 25: tamaños comerciales habituales; aspas aproximadas.
- Gabinete, tarjeta gráfica, procesador, zócalo, disipadores, conectores y cables:
  APROXIMADOS, elegidos solo para que la escena se vea proporcionada.
"""

import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(ROOT, "public", "models", "pc-completa.glb")
# Imagen de respaldo para navegadores sin WebGL (se renderiza con la misma escena).
FALLBACK_IMAGE = os.path.join(ROOT, "public", "images", "pc-respaldo.webp")
# Desplazamientos de la vista explotada que usa el visor (metros, ejes de three.js).
EXPLODE_OFFSETS = os.path.join(ROOT, "src", "viewer", "explodeOffsets.json")

MM = 0.001
SHARP_ANGLE = math.radians(35)

# ---------------------------------------------------------------------------
# Materiales: (color base lineal, metálico, rugosidad)
# ---------------------------------------------------------------------------

PALETTE = {
    "gabinete": ((0.78, 0.79, 0.81), 0.0, 0.42),
    "malla": ((0.035, 0.037, 0.042), 0.3, 0.6),
    "goma": ((0.02, 0.02, 0.022), 0.0, 0.9),
    "pcb_negro": ((0.022, 0.024, 0.028), 0.0, 0.5),
    "pcb_verde": ((0.025, 0.16, 0.075), 0.0, 0.45),
    "sustrato_cpu": ((0.04, 0.22, 0.10), 0.0, 0.45),
    "disipador": ((0.13, 0.135, 0.15), 0.85, 0.36),
    "aluminio": ((0.72, 0.74, 0.77), 1.0, 0.28),
    "oro": ((0.90, 0.64, 0.25), 1.0, 0.25),
    "chip": ((0.03, 0.03, 0.034), 0.1, 0.35),
    "plastico_negro": ((0.03, 0.031, 0.035), 0.0, 0.55),
    "plastico_gris": ((0.30, 0.31, 0.33), 0.0, 0.5),
    "aspas": ((0.06, 0.062, 0.07), 0.0, 0.45),
    "acento": ((0.043, 0.361, 0.678), 0.2, 0.35),
    "etiqueta": ((0.82, 0.83, 0.85), 0.0, 0.7),
    "cable": ((0.025, 0.025, 0.028), 0.0, 0.75),
    "fuente": ((0.028, 0.029, 0.033), 0.35, 0.5),
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


def axis_rotation(axis):
    """Matriz que lleva el eje Z local al eje indicado ('x', 'y' o 'z')."""
    if axis == "x":
        return Matrix.Rotation(math.radians(90), 4, "Y")
    if axis == "y":
        return Matrix.Rotation(math.radians(-90), 4, "X")
    return Matrix.Identity(4)


def placement(center_mm, axis="z", spin_deg=0.0):
    """Matriz local (en mm) → mundo (en m), con el eje Z local apuntando a `axis`."""
    return (
        Matrix.Translation(Vector(center_mm) * MM)
        @ axis_rotation(axis)
        @ Matrix.Rotation(math.radians(spin_deg), 4, "Z")
        @ Matrix.Scale(MM, 4)
    )


def _bevel(bm, width, segments):
    edges = [e for e in bm.edges if e.is_manifold and e.calc_face_angle(0) > SHARP_ANGLE]
    if edges:
        bmesh.ops.bevel(bm, geom=edges, offset=width, offset_type="OFFSET",
                        segments=segments, profile=0.5, affect="EDGES", clamp_overlap=True)


def _tube_bm(r_in, r_out, depth, segments):
    """Anillo hueco centrado en el origen, a lo largo de Z."""
    bm = bmesh.new()
    rings = []
    for r, z in ((r_out, -depth / 2), (r_out, depth / 2), (r_in, depth / 2), (r_in, -depth / 2)):
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / segments),
                                    r * math.sin(2 * math.pi * i / segments), z))
                      for i in range(segments)])
    for k in range(4):
        a, b = rings[k], rings[(k + 1) % 4]
        for i in range(segments):
            j = (i + 1) % segments
            bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def _surface_solid_bm(surface, nu, nv, thickness):
    """Sólido delgado a partir de una superficie paramétrica surface(u, v) → (x, y, z)."""
    bm = bmesh.new()
    layers = []
    for dz in (-thickness / 2, thickness / 2):
        layers.append([[bm.verts.new(Vector(surface(i / nu, j / nv)) + Vector((0, 0, dz)))
                        for j in range(nv + 1)] for i in range(nu + 1)])
    bottom, top = layers
    for i in range(nu):
        for j in range(nv):
            top_face = (top[i][j], top[i + 1][j], top[i + 1][j + 1], top[i][j + 1])
            bm.faces.new(top_face)
            bm.faces.new((bottom[i][j + 1], bottom[i + 1][j + 1], bottom[i + 1][j], bottom[i][j]))
    border = ([(i, 0) for i in range(nu)] + [(nu, j) for j in range(nv)] +
              [(i, nv) for i in range(nu, 0, -1)] + [(0, j) for j in range(nv, 0, -1)])
    for k, (i, j) in enumerate(border):
        i2, j2 = border[(k + 1) % len(border)]
        bm.faces.new((bottom[i][j], bottom[i2][j2], top[i2][j2], top[i][j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


class Piece:
    """Acumula geometría por material y la convierte en un nodo con una malla por material."""

    def __init__(self, name, parent=None):
        self.name = name
        self.parent = parent
        self.meshes = {}

    def _add(self, mat, bm, matrix):
        bmesh.ops.transform(bm, matrix=matrix, verts=bm.verts)
        dst = self.meshes.setdefault(mat, bmesh.new())
        vmap = {v: dst.verts.new(v.co) for v in bm.verts}
        for f in bm.faces:
            dst.faces.new([vmap[v] for v in f.verts])
        bm.free()

    def box(self, mat, x, y, z, bevel=0.0, segments=2):
        """Caja definida por rangos (min, max) en mm para cada eje del mundo."""
        size = [abs(b - a) for a, b in (x, y, z)]
        center = [(a + b) / 2 for a, b in (x, y, z)]
        self.box_local(mat, size, placement(center), bevel, segments)

    def box_local(self, mat, size, matrix, bevel=0.0, segments=2):
        """Caja de tamaño `size` (mm) centrada en el origen local de `matrix`."""
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
        if bevel > 0:
            _bevel(bm, min(bevel, min(size) * 0.45), segments)
        self._add(mat, bm, matrix)

    def cyl(self, mat, center, radius, depth, axis="z", segments=32, bevel=0.0, radius2=None):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=radius,
                              radius2=radius if radius2 is None else radius2, depth=depth)
        if bevel > 0:
            _bevel(bm, min(bevel, depth * 0.45, radius * 0.45), 2)
        self._add(mat, bm, placement(center, axis))

    def tube(self, mat, center, r_in, r_out, depth, axis="z", segments=48):
        self._add(mat, _tube_bm(r_in, r_out, depth, segments), placement(center, axis))

    def surface(self, mat, surface, nu, nv, thickness, matrix):
        self._add(mat, _surface_solid_bm(surface, nu, nv, thickness), matrix)

    def build(self):
        root = bpy.data.objects.new(self.name, None)
        bpy.context.scene.collection.objects.link(root)
        if self.parent is not None:
            root.parent = self.parent
        for mat, bm in self.meshes.items():
            mesh = bpy.data.meshes.new(f"{self.name}_{mat}")
            bm.to_mesh(mesh)
            bm.free()
            mesh.materials.append(material(mat))
            for poly in mesh.polygons:
                poly.use_smooth = True
            mesh.set_sharp_from_angle(angle=SHARP_ANGLE)
            obj = bpy.data.objects.new(mesh.name, mesh)
            bpy.context.scene.collection.objects.link(obj)
            obj.parent = root
        return root


# ---------------------------------------------------------------------------
# Subconjuntos reutilizables
# ---------------------------------------------------------------------------


def fan_rotor(p, center, axis, radius, thickness, blades=7, mat="aspas", hub_mat="plastico_negro"):
    """Rotor de ventilador: centro y aspas curvas con ángulo de ataque (aproximado)."""
    hub_r = radius * 0.34
    p.cyl(hub_mat, center, hub_r, thickness * 0.9, axis, segments=32, bevel=1.0)
    cap = Vector(center) + (axis_rotation(axis) @ Vector((0, 0, -thickness * 0.46)).to_4d()).to_3d()
    p.cyl("plastico_gris", tuple(cap), hub_r * 0.62, 0.6, axis, segments=32)
    span = 2 * math.pi / blades * 0.62
    pitch = thickness * 0.7

    def blade(u, v):
        r = hub_r * 0.92 + u * (radius - hub_r * 0.92)
        a = v * span * (0.75 + 0.35 * u) + 0.35 * u  # se ensancha y se curva hacia la punta
        return (r * math.cos(a), r * math.sin(a), (v - 0.5) * pitch * (1 - 0.35 * u))

    for i in range(blades):
        p.surface(mat, blade, 4, 5, 1.2, placement(center, axis, 360 * i / blades))


def fan(p, center, axis, size, thickness=25, frame_mat="plastico_negro"):
    """Ventilador completo con marco cuadrado, aro y brazos de soporte."""
    h = size / 2
    r_in = h * 0.93
    m = placement(center, axis)
    # Aro interior y esquinas del marco
    p.tube(frame_mat, center, r_in, r_in + 2.2, thickness, axis, segments=64)
    c = h * 0.34
    for sx in (-1, 1):
        for sy in (-1, 1):
            corner = m @ Matrix.Translation((sx * (h - c / 2), sy * (h - c / 2), 0))
            p.box_local(frame_mat, (c, c, thickness), corner, bevel=1.0)
    for k in range(4):  # paredes delgadas del marco
        side = m @ Matrix.Rotation(math.radians(90 * k), 4, "Z") @ Matrix.Translation((h - 1, 0, 0))
        p.box_local(frame_mat, (2, size - 2 * c + 2, thickness), side)
    for k in range(4):  # brazos que sostienen el motor (cara trasera)
        arm = (m @ Matrix.Rotation(math.radians(45 + 90 * k), 4, "Z")
               @ Matrix.Translation((h * 0.62, 0, thickness / 2 - 1.5)))
        p.box_local(frame_mat, (h * 0.62, 3, 3), arm)
    fan_rotor(p, center, axis, r_in - 1.5, thickness * 0.7)


def grille(p, center, axis, radius, mat="disipador"):
    """Rejilla de alambre: anillos concéntricos y dos barras en cruz."""
    for k in range(1, 5):
        r = radius * k / 4
        p.tube(mat, center, r - 0.8, r + 0.8, 1.6, axis, segments=56)
    m = placement(center, axis)
    for k in range(2):
        bar = m @ Matrix.Rotation(math.radians(45 + 90 * k), 4, "Z")
        p.box_local(mat, (radius * 2, 1.6, 1.6), bar)


def fins(p, mat, x, y, z, along, count, thickness=1.0):
    """Aletas de disipador: `count` placas repartidas a lo largo del eje `along`."""
    ranges = {"x": x, "y": y, "z": z}
    lo, hi = ranges[along]
    step = (hi - lo) / count
    for i in range(count):
        a = lo + i * step + (step - thickness) / 2
        ranges[along] = (a, a + thickness)
        p.box(mat, ranges["x"], ranges["y"], ranges["z"])


# ---------------------------------------------------------------------------
# Escena
# ---------------------------------------------------------------------------


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights,
                  bpy.data.curves):
        for item in list(block):
            block.remove(item)


def build_case():
    """Gabinete torre (aproximado): 214 x 464 x 462 mm, lado izquierdo abierto."""
    p = Piece("GABINETE")
    w = "gabinete"
    p.box(w, (100, 105), (-212, 225), (10, 460), bevel=1.5)              # lateral derecho
    p.box(w, (-105, 100), (-212, 225), (455, 460), bevel=1.5)            # techo
    p.box(w, (-105, 100), (-212, 225), (10, 15), bevel=1.5)              # piso
    p.box(w, (-105, 100), (220, 225), (15, 455), bevel=1.0)              # trasera
    # Frente: marco blanco con malla oscura al centro
    p.box(w, (-107, 107), (-234, -212), (8, 26), bevel=3)
    p.box(w, (-107, 107), (-234, -212), (444, 462), bevel=3)
    p.box(w, (-107, -92), (-234, -212), (26, 444), bevel=3)
    p.box(w, (92, 107), (-234, -212), (26, 444), bevel=3)
    p.box("malla", (-92, 92), (-226, -214), (26, 444))
    for z in range(32, 444, 9):
        p.box("plastico_negro", (-92, 92), (-227.5, -226), (z, z + 3))
    # Techo: rejilla de ventilación y panel frontal de E/S (botón, USB, audio)
    p.box("malla", (-70, 70), (-120, 160), (460, 461))
    p.cyl("aluminio", (-60, -195, 461), 7, 2.5, "z", bevel=0.6)
    p.cyl("acento", (-60, -195, 462.3), 3, 0.4, "z")
    for x in (-30, -12):
        p.box("plastico_negro", (x, x + 13), (-200, -194), (460, 460.6))
    p.cyl("plastico_negro", (12, -197, 460.3), 2.5, 0.6, "z", segments=16)
    # Patas de goma
    for x, y in ((-80, -190), (80, -190), (-80, 195), (80, 195)):
        p.cyl("goma", (x, y, 5), 14, 10, "z", bevel=2)
    # Trasera: tapas de las ranuras de expansión (paso ATX de 20,32 mm)
    for i in range(7):
        z = 282 - i * 20.32
        p.box("aluminio", (-26, 94), (225, 226), (z - 17, z), bevel=0.3)
        for k in range(3):
            p.box("malla", (-10 + 30 * k, 10 + 30 * k), (225.8, 226.2), (z - 10, z - 7))
    grille(p, (-38, 226, 370), "y", 58, mat="aluminio")
    # Pasacables de goma en la bandeja de la placa madre
    for z in (180, 300, 410):
        p.box("goma", (97, 100), (-58, -40), (z - 35, z + 35), bevel=4)
    p.box("goma", (97, 100), (130, 200), (447, 454), bevel=2.5)
    fan(p, (-2.5, -199.5, 150), "y", 140)
    fan(p, (-2.5, -199.5, 300), "y", 140)
    fan(p, (-38, 207.5, 370), "y", 120)
    return p.build()


def build_motherboard():
    """Placa madre ATX: 305 x 244 mm (estándar ATX). La cara con componentes mira a -X."""
    p = Piece("PLACA_MADRE")
    p.box("pcb_negro", (92, 93.6), (-30, 214), (140, 445), bevel=0.6)
    # Orificios de montaje (posiciones aproximadas)
    for y, z in ((-24, 439), (-24, 260), (-24, 146), (60, 439), (60, 146), (178, 439),
                 (178, 260), (178, 146), (110, 300)):
        p.tube("aluminio", (91.9, y, z), 1.8, 3.6, 0.3, "x", segments=20)
    # Cubierta del panel trasero de conectores y disipadores de los reguladores (VRM)
    p.box("disipador", (72, 92), (188, 214), (300, 440), bevel=2)
    p.box("aluminio", (71.5, 72), (192, 210), (310, 430), bevel=0.2)
    p.box("disipador", (84, 92), (60, 172), (406, 432), bevel=1)
    fins(p, "disipador", (76, 84), (60, 172), (408, 430), "y", 14, thickness=2.4)
    p.box("disipador", (84, 92), (164, 186), (318, 404), bevel=1)
    fins(p, "disipador", (76, 84), (164, 186), (320, 402), "z", 10, thickness=2.4)
    for y in range(64, 168, 12):  # bobinas bajo el disipador superior
        p.box("plastico_gris", (87, 92), (y, y + 8), (398, 405), bevel=0.5)
    # Zócalo del procesador: base, marco de retención y palanca
    p.box("plastico_negro", (89, 92), (88, 142), (333, 387), bevel=0.4)
    for y, z in (((88, 95), (333, 387)), ((135, 142), (333, 387)),
                 ((95, 135), (333, 338)), ((95, 135), (382, 387))):
        p.box("aluminio", (87.6, 89), y, z, bevel=0.3)
    p.cyl("aluminio", (88.2, 146, 360), 0.9, 54, "z", segments=12)
    p.box("aluminio", (82, 89), (145, 147.5), (386, 389), bevel=0.4)
    for y, z in ((80, 325), (80, 395), (150, 325), (150, 395)):  # orificios del disipador
        p.tube("aluminio", (91.9, y, z), 1.6, 3.2, 0.3, "x", segments=16)
    # Condensadores junto al zócalo
    for z in range(330, 395, 12):
        p.cyl("disipador", (88, 155, z), 3.5, 8, "x", segments=20, bevel=0.6)
    # Ranuras de memoria (colores alternados) con trabas en los extremos
    for i, y in enumerate((40, 52, 64, 76)):
        mat = "plastico_negro" if i % 2 == 0 else "plastico_gris"
        p.box(mat, (86, 92), (y - 3, y + 3), (290, 433), bevel=0.6)
        p.box("plastico_gris", (84, 92), (y - 3.2, y + 3.2), (283, 290), bevel=0.8)
        p.box("plastico_gris", (84, 92), (y - 3.2, y + 3.2), (433, 440), bevel=0.8)
    # Ranuras PCIe: x16 reforzada (89 mm, PCI-SIG), x1 y una segunda x16
    p.box("aluminio", (85.5, 92), (100, 190), (267.5, 276.5), bevel=0.6)
    p.box("plastico_negro", (85.2, 85.6), (101, 189), (271, 273))
    p.box("plastico_gris", (84, 92), (190, 197), (267.5, 276.5), bevel=0.8)
    p.box("plastico_negro", (86, 92), (100, 125), (205, 213), bevel=0.6)
    p.box("plastico_negro", (86, 92), (100, 190), (178, 186), bevel=0.6)
    p.box("plastico_gris", (84, 92), (190, 197), (178, 186), bevel=0.8)
    # Conector M.2 y su tornillo de soporte (el SSD es otra pieza)
    p.box("plastico_negro", (88, 92), (84, 90), (285, 309), bevel=0.4)
    p.cyl("aluminio", (90, 172, 297), 2.5, 4, "x", segments=16, bevel=0.4)
    # Disipador del chipset
    p.box("disipador", (82, 92), (12, 62), (186, 230), bevel=2.5)
    p.box("aluminio", (81.5, 82), (20, 54), (196, 220), bevel=0.3)
    p.box("acento", (81.3, 81.5), (24, 50), (206, 210))
    # Pila CR2032 (20 x 3,2 mm, IEC 60086) en su soporte
    p.cyl("plastico_negro", (90.5, 140, 158), 11.5, 3, "x", segments=32, bevel=0.5)
    p.cyl("aluminio", (87.4, 140, 158), 10, 3.2, "x", segments=40, bevel=0.5)
    # Conectores de alimentación, SATA, panel frontal y chips
    p.box("plastico_negro", (80, 92), (-27, -12), (320, 376), bevel=1)    # 24 pines
    p.box("plastico_negro", (82, 92), (150, 170), (433, 443), bevel=0.8)  # 8 pines CPU
    for k in range(4):
        z = 190 + k * 11
        p.box("plastico_negro", (84, 92), (-30, -22), (z, z + 8), bevel=0.5)
    p.box("plastico_negro", (88, 92), (150, 176), (143, 150), bevel=0.4)
    p.box("chip", (90.6, 92), (-5, 7), (148, 160), bevel=0.3)
    p.box("chip", (90.6, 92), (60, 76), (150, 166), bevel=0.3)
    p.box("chip", (90.6, 92), (30, 38), (250, 258), bevel=0.2)
    return p.build()


def build_cpu():
    """Procesador genérico: sustrato y disipador integrado (IHS). Medidas aproximadas."""
    p = Piece("CPU")
    p.box("sustrato_cpu", (88, 89.2), (95.5, 134.5), (338.5, 381.5), bevel=0.3)
    p.box("aluminio", (86.5, 88), (99, 131), (343, 377), bevel=0.8)
    p.box("aluminio", (85.2, 86.5), (102, 128), (346, 374), bevel=1.0)
    return p.build()


def build_ram():
    """Dos módulos DIMM de 133,35 mm (JEDEC) con chips a la vista. Altura aproximada."""
    p = Piece("RAM_1")
    for y in (52, 76):
        z0, z1 = 296.0, 296.0 + 133.35
        p.box("pcb_verde", (56, 88), (y - 0.635, y + 0.635), (z0, z1), bevel=0.3)
        p.box("oro", (84, 87.5), (y - 0.7, y + 0.7), (z0 + 3, z1 - 3))
        for side in (-1, 1):
            for k in range(8):
                zc = z0 + 9 + k * 15.6
                y0 = y + side * 0.635
                p.box("chip", (63, 75), sorted((y0, y0 + side * 1.0)), (zc, zc + 11), bevel=0.2)
        p.box("etiqueta", (57, 61), (y - 0.75, y + 0.75), (z0 + 20, z1 - 20))
    return p.build()


def build_gpu():
    """Tarjeta gráfica genérica de dos ranuras, montada en la x16 superior. Medidas aproximadas."""
    p = Piece("GPU")
    # PCB y contactos que entran en la ranura
    p.box("pcb_negro", (-20, 86), (-55, 205), (271, 272.6), bevel=0.4)
    p.box("oro", (86, 91), (104, 186), (271, 272.6))
    # Placa trasera
    p.box("disipador", (-20, 84), (-55, 205), (272.6, 275), bevel=1.0)
    p.box("acento", (-20.4, -20), (-30, 160), (273.2, 274.4))
    # Aletas del disipador entre la carcasa y el PCB
    fins(p, "aluminio", (-18, 82), (-52, 202), (262, 270.8), "y", 64, thickness=0.8)
    # Carcasa con dos ventiladores en la cara inferior
    p.box("disipador", (-22, 84), (-60, 205), (232, 262), bevel=3)
    p.box("aluminio", (-22.6, -22), (-50, 195), (244, 250), bevel=0.3)
    p.box("acento", (-22.8, -22.4), (-40, 120), (238, 241))
    for y in (22, 132):
        p.tube("plastico_negro", (31, y, 230.5), 44, 49, 3, "z", segments=56)
        fan_rotor(p, (31, y, 229.5), "z", 43, 6, blades=9)
    # Soporte metálico con salidas de video
    p.box("aluminio", (-24, 94), (205, 207), (226, 276), bevel=0.3)
    for k in range(4):
        x = -10 + k * 20
        p.box("plastico_negro", (x, x + 14), (207, 208), (252, 258))
    # Conector de alimentación de 8 pines en el borde
    p.box("plastico_negro", (-21, -11), (125, 150), (272.6, 281), bevel=0.8)
    return p.build()


def build_psu():
    """Fuente de poder ATX: 150 x 86 x 140 mm (ATX12V Design Guide)."""
    p = Piece("FUENTE")
    p.box("fuente", (-75, 75), (80, 220), (15, 101), bevel=2.5)
    # Ventilador visible tras la rejilla de la cara superior
    p.cyl("malla", (0, 150, 101.2), 60, 0.6, "z", segments=56)
    fan_rotor(p, (0, 150, 103), "z", 56, 3.6, blades=9)
    grille(p, (0, 150, 105.4), "z", 60)
    # Panel de conectores modulares (frente) y etiqueta lisa sin marca (lateral)
    p.box("plastico_negro", (-68, 68), (79, 80), (22, 94), bevel=0.5)
    for row, z in enumerate((30, 50, 70)):
        for k in range(5 - row % 2):
            x = -58 + k * 26
            p.box("malla", (x, x + 18), (78.4, 79), (z, z + 12), bevel=0.3)
    p.box("etiqueta", (-75.6, -75), (100, 200), (32, 84), bevel=0.4)
    for k in range(4):
        p.box("plastico_gris", (-75.8, -75.6), (110, 170 - k * 12), (72 - k * 10, 75 - k * 10))
    # Ventilación, entrada de corriente e interruptor (cara trasera, fuera del gabinete)
    for k in range(8):
        p.box("malla", (-65 + k * 9, -59 + k * 9), (226, 226.5), (30, 86))
    p.box("plastico_negro", (20, 50), (225, 228), (40, 62), bevel=0.8)
    p.box("plastico_negro", (55, 66), (225, 229), (44, 58), bevel=0.8)
    return p.build()


def build_storage():
    """SSD M.2 2280: 22 x 80 mm (especificación M.2), con etiqueta lisa."""
    p = Piece("ALMACENAMIENTO")
    p.box("pcb_negro", (88.6, 89.4), (89, 169), (286, 308), bevel=0.2)
    p.box("oro", (88.5, 89.5), (89, 92), (288, 306))
    p.box("chip", (87.4, 88.6), (93, 101), (291, 303), bevel=0.2)
    p.box("etiqueta", (88.3, 88.6), (103, 166), (287, 307))
    p.box("acento", (88.2, 88.3), (106, 108), (289, 305))
    return p.build()


def cable(name, points_mm, radius_mm, parent):
    """Cable enfundado que sigue una curva suave por los puntos dados (convertido a malla)."""
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius_mm * MM
    curve.bevel_resolution = 3
    curve.resolution_u = 10
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points_mm) - 1)
    for bp, pt in zip(spline.bezier_points, points_mm):
        bp.co = Vector(pt) * MM
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    spline.use_endpoint_u = True
    curve.use_fill_caps = True
    temp = bpy.data.objects.new(f"{name}_curva", curve)
    bpy.context.scene.collection.objects.link(temp)
    depsgraph = bpy.context.evaluated_depsgraph_get()
    mesh = bpy.data.meshes.new_from_object(temp.evaluated_get(depsgraph))
    mesh.name = name
    bpy.data.objects.remove(temp, do_unlink=True)
    bpy.data.curves.remove(curve)
    mesh.materials.clear()
    mesh.materials.append(material("cable"))
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent


def build_cables():
    """Cables de la fuente con sus fichas. Recorridos aproximados; no son clicables."""
    p = Piece("CABLES")
    p.box("plastico_negro", (68, 80), (-28, -11), (319, 377), bevel=1.2)   # ficha 24 pines
    p.box("plastico_negro", (72, 82), (149, 171), (432, 444), bevel=1)     # ficha 8 pines CPU
    p.box("plastico_negro", (-31, -21), (124, 151), (272.6, 281), bevel=1)  # ficha 8 pines GPU
    for x, z in ((40, 60), (10, 60), (-20, 60)):                          # fichas modulares
        p.box("plastico_negro", (x - 9, x + 9), (72, 79), (z - 6, z + 6), bevel=0.8)
    root = p.build()
    cable("CABLES_24_pines_a", [(40, 72, 60), (45, 20, 85), (80, -50, 150), (97, -49, 180)], 6, root)
    cable("CABLES_24_pines_b", [(97, -49, 330), (85, -38, 345), (74, -26, 348)], 6, root)
    cable("CABLES_cpu", [(97, 165, 451), (85, 162, 449), (77, 160, 444)], 3.5, root)
    cable("CABLES_gpu", [(-20, 72, 60), (-45, 60, 140), (-42, 137, 245), (-31, 137, 277)], 4,
          root)
    cable("CABLES_ram_libre", [(10, 72, 60), (20, 30, 70), (60, -30, 90), (97, -49, 175)], 3,
          root)
    return root


# ---------------------------------------------------------------------------
# Exportación y render
# ---------------------------------------------------------------------------


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


def setup_render(resolution=(960, 800)):
    """Cámara igual a la vista inicial del visor, luces de estudio y fondo transparente."""
    scene = bpy.context.scene
    target = Vector((0.0, 0.0, 0.235))
    # Misma dirección que la cámara inicial del visor (src/viewer/Viewer.tsx), en ejes de Blender.
    direction = Vector((-0.8, -0.6, 0.45)).normalized()
    radius = 0.36  # radio aproximado de la esfera que envuelve el gabinete
    fov = math.radians(40)

    cam_data = bpy.data.cameras.new("CamaraRespaldo")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.angle_y = fov
    cam = bpy.data.objects.new("CamaraRespaldo", cam_data)
    scene.collection.objects.link(cam)
    cam.location = target + direction * (radius / math.sin(fov / 2))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam

    def area(name, location, energy, size):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.size = size
        obj = bpy.data.objects.new(name, data)
        obj.location = location
        obj.rotation_euler = (target - Vector(location)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(obj)

    area("LuzLadoAbierto", (-1.2, -0.4, 0.8), 70, 1.2)
    area("LuzSuperior", (0.0, 0.0, 1.4), 35, 1.5)
    area("LuzFrontal", (0.3, -1.3, 0.5), 25, 1.0)
    area("Contraluz", (0.6, 1.0, 0.9), 20, 1.0)

    world = bpy.data.worlds.new("Mundo")
    if world.node_tree is None:  # Blender < 5
        world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.85, 0.87, 0.9, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.25
    scene.world = world

    scene.render.engine = "BLENDER_EEVEE"
    eevee = scene.eevee
    for attr, value in (("use_raytracing", True), ("use_shadows", True),
                        ("taa_render_samples", 64)):
        if hasattr(eevee, attr):
            setattr(eevee, attr, value)
    scene.render.film_transparent = True
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.quality = 85
    scene.view_settings.view_transform = "AgX"
    return [cam, *[o for o in scene.objects if o.type == "LIGHT"]]


def render(path):
    scene = bpy.context.scene
    scene.render.filepath = path
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.render.render(write_still=True)


def apply_explode(factor):
    """Mueve cada pieza según explodeOffsets.json (ejes three.js → Blender) y oculta cables."""
    with open(EXPLODE_OFFSETS, encoding="utf-8") as fh:
        offsets = json.load(fh)
    for name, (x, y, z) in offsets.items():
        bpy.data.objects[name].location = Vector((x, -z, y)) * factor
    for obj in bpy.data.objects["CABLES"].children_recursive + [bpy.data.objects["CABLES"]]:
        obj.hide_render = factor > 0


def main():
    clear_scene()
    build_case()
    build_motherboard()
    build_cpu()
    build_ram()
    build_gpu()
    build_psu()
    build_storage()
    build_cables()

    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    positional = [a for a in args if not a.startswith("--")]
    options = dict(a[2:].split("=", 1) if "=" in a else (a[2:], "") for a in args
                   if a.startswith("--"))

    out = os.path.abspath(positional[0]) if positional else OUTPUT
    export(out)
    print(f"[build_model] Exportado {out} ({os.path.getsize(out) / 1024:.0f} KB)")

    preview_dir = options.get("vista-previa")
    if "sin-imagen" in options and not preview_dir:
        return
    helpers = setup_render()
    if preview_dir:
        for factor, file in ((0, "armada.webp"), (1, "explotada.webp")):
            apply_explode(factor)
            render(os.path.join(os.path.abspath(preview_dir), file))
        apply_explode(0)
    if "sin-imagen" not in options:
        render(FALLBACK_IMAGE)
        print(f"[build_model] Imagen de respaldo {FALLBACK_IMAGE} "
              f"({os.path.getsize(FALLBACK_IMAGE) / 1024:.0f} KB)")
    for obj in helpers:
        bpy.data.objects.remove(obj, do_unlink=True)


if __name__ == "__main__":
    main()
