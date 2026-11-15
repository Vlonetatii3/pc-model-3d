import './SafetyNotice.css';

/** Advertencia de seguridad obligatoria en guías con `safetyWarning: true`. */
export default function SafetyNotice() {
  return (
    <aside className="safety-notice" role="note" aria-labelledby="safety-notice-title">
      <h2 id="safety-notice-title">Advertencia de seguridad</h2>
      <ul>
        <li>Apaga la PC y desconecta el cable de corriente antes de abrir el gabinete.</li>
        <li>
          No abras la fuente de poder: algunos componentes internos pueden conservar carga eléctrica
          aunque esté desconectada.
        </li>
        <li>
          Si algo huele a quemado, hace chispas o no estás seguro, detente y consulta a un técnico.
        </li>
      </ul>
    </aside>
  );
}
