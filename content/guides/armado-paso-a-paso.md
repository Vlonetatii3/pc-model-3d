---
title: 'Armado de PC paso a paso'
slug: 'armado-paso-a-paso'
level: 'intermedio'
estimatedTime: 'pendiente de verificar'
safetyWarning: true
relatedComponents: ['placa-madre', 'cpu', 'ram', 'gpu', 'fuente', 'almacenamiento']
---

> **Borrador pendiente de revisión técnica.** Esta guía describe pasos generales. El orden exacto, los conectores y las ranuras cambian según el modelo: ante cualquier diferencia, manda el manual de tu placa madre, tu gabinete y cada pieza.

## Qué necesitas

- Todas las piezas: gabinete, placa madre, procesador con su disipador, memoria RAM, almacenamiento, fuente de poder y, si la usas, tarjeta gráfica.
- Los manuales de la placa madre y del gabinete (impresos o en PDF desde la web del fabricante).
- Un destornillador de cruz (Phillips) de tamaño mediano.
- Pasta térmica, solo si el disipador no la trae aplicada de fábrica.
- Una mesa amplia, limpia y bien iluminada, lejos de alfombras.
- Bridas o velcro para ordenar los cables.
- Opcional: una pulsera antiestática.

## Pasos

1. **Prepara el lugar.** Trabaja con todo desconectado de la corriente. Antes de tocar las piezas, toca una superficie metálica sin pintar para descargar la electricidad estática, y repítelo cada tanto. Toma las placas por los bordes.
2. **Lee el manual de la placa madre.** Ubica el zócalo del procesador, las ranuras de memoria recomendadas, la ranura M.2 y los conectores de alimentación. Ten el manual a mano durante todo el armado.
3. **Instala el procesador fuera del gabinete.** Con la placa sobre su caja, levanta la palanca del zócalo. Alinea la marca de la esquina del procesador (un triángulo pequeño) con la marca del zócalo y apóyalo sin presionar ni arrastrarlo. Baja la palanca. No toques los contactos ni los pines.
4. **Coloca el disipador del procesador.** Retira el plástico protector de la base si lo tiene. Si la pasta térmica no viene aplicada, colócala según las instrucciones del fabricante del disipador. Fíjalo siguiendo su manual y conecta su ventilador al conector marcado `CPU_FAN`.
5. **Instala la memoria RAM.** Abre las trabas de la ranura, alinea la muesca del módulo con la de la ranura y presiona de forma pareja hasta que las trabas cierren solas. Si usas dos módulos, ponlos en las ranuras que indica el manual.
6. **Instala el SSD M.2.** Retira el tornillo o la traba de la ranura, inserta el SSD en ángulo, bájalo y fíjalo. Si la placa trae un disipador para el M.2, quita el plástico de su almohadilla antes de colocarlo.
7. **Prepara el gabinete.** Coloca la placa trasera de puertos (la chapa con agujeros) si tu placa madre no la trae integrada. Verifica que los separadores metálicos del gabinete coincidan con los orificios de la placa madre: no debe quedar ninguno donde la placa no tenga orificio.
8. **Monta la placa madre.** Bájala en ángulo, encaja los puertos traseros en su chapa y atorníllala a los separadores. Ajusta los tornillos sin forzarlos.
9. **Instala la fuente de poder.** Atorníllala en su lugar con el ventilador orientado hacia una zona con ventilación, según indique el manual del gabinete.
10. **Instala la tarjeta gráfica.** Retira las tapas traseras de las ranuras que va a ocupar. Insértala en la ranura PCIe x16 que indique el manual (normalmente la superior) hasta que la traba haga clic, y atorníllala al gabinete.
11. **Conecta los cables.** Alimentación de la placa, del procesador y de la tarjeta gráfica, panel frontal y ventiladores. Lo explica en detalle la guía [Cableado básico](/guias/cableado-basico).
12. **Revisa antes de encender.** Que no queden tornillos sueltos dentro, que todos los conectores estén firmes y que ningún cable toque un ventilador.
13. **Haz el primer encendido.** Conecta el monitor a la tarjeta gráfica (si tienes una) y la fuente a la corriente. Pon su interruptor en encendido y presiona el botón del gabinete. Entra a la configuración de la placa (BIOS o UEFI) y verifica que reconozca el procesador, toda la memoria y el almacenamiento. Si no enciende, sigue la guía [La PC no enciende](/guias/pc-no-enciende).

## Errores comunes

- **Olvidar la chapa de puertos traseros** y darse cuenta con la placa ya atornillada.
- **Conectar el monitor a la placa madre** en lugar de a la tarjeta gráfica: la PC enciende pero no da imagen.
- **Dejar la RAM a medio insertar.** Si las trabas no cerraron solas, el módulo no está bien colocado.
- **Olvidar el cable de alimentación del procesador** (el de 4+4 u 8 pines cerca del zócalo).
- **Dejar el plástico protector** en la base del disipador.
- **Dejar un separador metálico de más** debajo de la placa madre, donde puede causar un cortocircuito.
- **Forzar una pieza** que no entra. Casi siempre está girada o en la ranura equivocada.

## Cuándo pedir ayuda profesional

- Si se dobló algún pin del zócalo o del procesador.
- Si sientes olor a quemado, ves humo o chispas: desconecta la PC de la corriente y no la vuelvas a encender.
- Si una pieza se golpeó, se cayó o tiene daño visible.
- Si la PC no da imagen después de seguir la guía [La PC no enciende](/guias/pc-no-enciende).
- Si alguna pieza está en garantía y tienes dudas: revisa sus condiciones antes de manipularla.
