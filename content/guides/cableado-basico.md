---
title: 'Cableado básico'
slug: 'cableado-basico'
level: 'básico'
estimatedTime: 'pendiente de verificar'
safetyWarning: true
relatedComponents: ['placa-madre', 'gpu', 'fuente', 'almacenamiento']
---

> **Borrador pendiente de revisión técnica.** La ubicación y el nombre de los conectores cambian según el modelo. Usa siempre el diagrama del manual de tu placa madre y las etiquetas de tu fuente.

## Qué necesitas

- La PC desconectada de la corriente, con el interruptor de la fuente apagado.
- El manual de la placa madre, abierto en el diagrama de conectores.
- Los cables que vinieron con tu fuente de poder.
- Una linterna.
- Bridas o velcro para ordenar.

## Pasos

1. **Corta la corriente.** Desconecta el cable de corriente y pon el interruptor trasero de la fuente en apagado (`O`). Toca una superficie metálica sin pintar para descargar la electricidad estática.
2. **Identifica los cables de la fuente.** Por lo general vienen marcados:
   - **ATX de 24 pines** (a veces 20+4): alimenta la placa madre.
   - **CPU o EPS de 4+4 u 8 pines**: alimenta el procesador.
   - **PCIe de 6+2 pines**, o el conector de 16 pines de algunas tarjetas recientes: alimenta la tarjeta gráfica.
   - **SATA**: alimenta discos y unidades SATA.
3. **Si tu fuente es modular,** conecta en la fuente solo los cables que vas a usar, cada uno en el conector con su misma etiqueta. Usa únicamente los cables que vinieron con esa fuente: los de otra marca o modelo pueden tener otro orden de pines aunque encajen.
4. **Conecta el cable de 24 pines** a la placa madre. Tiene una sola orientación, marcada por la traba: empuja hasta escuchar el clic.
5. **Conecta la alimentación del procesador.** El conector suele estar en la parte superior de la placa, cerca del zócalo. Si la placa tiene dos, revisa en el manual cuáles son obligatorios. No uses aquí un cable PCIe: se parecen, pero no son iguales.
6. **Conecta la tarjeta gráfica.** Conecta todos los conectores de alimentación que tenga la tarjeta, cada uno insertado por completo. Si usa el conector de 16 pines, revisa que entre hasta el fondo y evita doblar el cable justo al salir del conector; sigue el manual de la tarjeta.
7. **Conecta el panel frontal.** Son los cables finos del botón de encendido (`PWR_SW` o similar), reinicio (`RESET`) y luces (`POWER LED`, `HDD LED`). Ubica el bloque de pines con el diagrama del manual. En las luces importa la polaridad: el cable marcado `+` va al pin `+`.
8. **Conecta los puertos frontales.** El USB y el audio del gabinete van a sus conectores en la placa madre, normalmente identificados como `USB` y `HD_AUDIO` o `AAFP`.
9. **Conecta los ventiladores.** El del procesador va a `CPU_FAN`. Los del gabinete, a los conectores `SYS_FAN` o `CHA_FAN`.
10. **Conecta el almacenamiento SATA, si tienes.** Necesita dos cables: el de datos, a un puerto SATA de la placa, y el de alimentación SATA, a la fuente. Un SSD M.2 no lleva cables.
11. **Ordena los cables.** Pásalos por detrás de la bandeja de la placa cuando el gabinete lo permita y sujétalos con bridas. Verifica que ninguno toque las aspas de un ventilador.

## Errores comunes

- **Confundir el cable del procesador con uno PCIe** porque tienen un tamaño parecido.
- **Usar cables modulares de otra fuente.** Pueden dañar las piezas aunque el conector encaje.
- **Dejar el conector de 24 pines o el de la tarjeta gráfica a medio insertar.**
- **Conectar el botón de encendido en los pines equivocados:** la PC no responde al botón.
- **Invertir la polaridad de una luz del panel frontal:** la luz no enciende. Gira el conector.
- **No conectar el ventilador del procesador.** Algunas placas muestran un aviso o no arrancan sin él.

## Cuándo pedir ayuda profesional

- Si un conector no entra sin forzarlo, o tiene pines doblados o quemados.
- Si un cable o conector se ve derretido o huele a quemado.
- Si la fuente hace chispas, ruidos extraños o humo: desconéctala y no la vuelvas a usar.
- Si no encuentras en el manual dónde va un cable.
- Nunca abras la fuente de poder para revisarla por dentro.
