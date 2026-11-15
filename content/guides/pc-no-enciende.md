---
title: 'La PC no enciende'
slug: 'pc-no-enciende'
level: 'básico'
estimatedTime: 'pendiente de verificar'
safetyWarning: true
relatedComponents: ['placa-madre', 'cpu', 'ram', 'fuente']
---

> **Borrador pendiente de revisión técnica.** Esta guía ordena las revisiones de la más simple a la más compleja. Los códigos de luces o pitidos y la forma de reiniciar la configuración dependen de cada placa madre: consúltalos en su manual.

## Qué necesitas

- Otro aparato para probar el enchufe (una lámpara, un cargador).
- Un cable de corriente de repuesto, si tienes.
- Una linterna.
- El manual de la placa madre, en especial la sección de diagnóstico.
- Un destornillador de cruz, para abrir el gabinete.

## Pasos

1. **Prueba el enchufe.** Conecta otro aparato al mismo enchufe. Si usas una zapatilla o regleta, verifica que esté encendida, o prueba conectando la PC directo a la pared.
2. **Revisa el interruptor de la fuente.** Está en la parte trasera de la PC: debe estar en encendido (`I`).
3. **Revisa el cable de corriente.** Que entre firme en la fuente. Si tienes otro cable, pruébalo.
4. **Observa qué pasa al presionar el botón.** A partir de aquí, el camino depende del síntoma:
   - **No pasa nada:** no hay luces ni ventiladores. Sigue con el paso 5.
   - **Los ventiladores giran pero no hay imagen:** salta al paso 7.
   - **Enciende y se apaga enseguida:** sigue con el paso 5 y revisa también el disipador del procesador (paso 10).
5. **Desconecta la PC y abre el gabinete.** Desconecta el cable de corriente, apaga el interruptor de la fuente y espera unos minutos. Toca una superficie metálica sin pintar para descargar la electricidad estática.
6. **Revisa las conexiones de energía y del botón.** Comprueba que el conector de 24 pines y el del procesador estén insertados hasta el fondo. Verifica con el manual que el cable del botón de encendido esté en los pines correctos del panel frontal.
7. **Revisa el monitor.** Que esté encendido, en la entrada correcta (HDMI, DisplayPort, etc.) y conectado a la tarjeta gráfica si tienes una, no a la placa madre.
8. **Mira las luces o escucha los pitidos de diagnóstico.** Muchas placas tienen luces marcadas `CPU`, `DRAM`, `VGA` y `BOOT`, o emiten pitidos. Anota cuál queda encendida o la secuencia de pitidos y busca su significado en el manual.
9. **Vuelve a colocar la memoria RAM.** Con la PC desconectada, retira los módulos y vuelve a insertarlos hasta que cierren las trabas. Si tienes dos, prueba con uno solo, en la ranura que indique el manual, y luego con el otro.
10. **Revisa el disipador del procesador.** Que esté bien fijo y que su ventilador esté conectado a `CPU_FAN`.
11. **Reinicia la configuración de la placa (borrar CMOS).** Sigue el procedimiento del manual: puede ser un botón, un puente (jumper) o retirar la pila redonda de la placa durante el tiempo que indique. Con esto se pierden los ajustes guardados.
12. **Prueba con lo mínimo.** Deja conectados solo la placa madre, el procesador con su disipador, un módulo de RAM y la fuente. Si tu procesador tiene gráficos integrados (revisa sus especificaciones), retira la tarjeta gráfica y conecta el monitor a la placa. Si así enciende, vuelve a agregar las piezas de a una para encontrar la que falla.

## Errores comunes

- **Pasar por alto lo básico:** el interruptor trasero de la fuente, la zapatilla apagada o el monitor en otra entrada.
- **Conectar o desconectar piezas con la PC enchufada.**
- **Concluir que la placa madre está dañada** sin revisar antes la RAM, los cables de energía y el monitor.
- **Abrir la fuente de poder para revisarla.** Puede conservar carga eléctrica aunque esté desconectada.
- **Cambiar varias cosas a la vez.** Si la PC vuelve a funcionar, no sabrás qué la arregló.

## Cuándo pedir ayuda profesional

- Si sientes olor a quemado, ves humo o chispas: desconecta la PC y no la vuelvas a encender.
- Si sospechas de la fuente de poder. Probarla requiere herramientas y conocimientos de electricidad.
- Si ves condensadores hinchados, piezas quemadas o daño visible en la placa.
- Si seguiste todos los pasos y la PC sigue sin encender.
- Si el equipo está en garantía: abrirlo puede afectarla, revisa sus condiciones.
