# Generalidades

- El cluster está destinado exclusivamente a actividades de investigación y desarrollo en el marco del IALab. Está prohibido el uso del cluster para actividades de cursos y personales, de cualquier tipo, que no sean de investigación amparadas por algún supervisor.
- El uso del cluster debe priorizar la eficiencia en el consumo de recursos y la equidad entre los usuarios.
- No se deben ejecutar experimentos innecesarios que consuman recursos sin propósito justificado.
- Cada usuario es responsable de sus datos y código. Se recomienda realizar copias de seguridad de la información crítica en el NAS o en un sistema externo.

# Vigencia de Cuentas

- Cada cuenta creada en el cluster estará asociada a un investigador/profesor de aquí en adelante Supervisor. Una vez por semestre se enviará al Supervisor asociado una lista con las cuentas asociadas a él para verificar si deben seguir vigentes por el próximo semestre.
- Existirá un plazo de 14 días para responder. Si en ese plazo no hay respuestas, todas las cuentas asociadas al Supervisor serán bloqueadas hasta recibir la respuesta del status de cada una de las cuentas.
- No pueden haber cuentas que no estén asociadas a un Supervisor.
- Sólo pueden ser Supervisores: investigadores de CENIA, profesores del DCC UC y administradores del Cluster.

# Responsabilidades de los Supervisores

- Será responsabilidad de los Supervisores responder de forma oportuna a los requerimientos de información del equipo de administración respecto a la vigencia de las cuentas de usuario a su nombre.

# Acceso al Cluster

- No se deben ejecutar procesos complejos que consuman recursos de cómputo en el nodo de inicio de sesión (kraken). Este nodo es un recurso compartido disponible para admitir clústeres de E/S externos, así como la compilación básica y la interacción con el administrador de recursos. Los usuarios que incumplan esta política estarán sujetos a penalizaciones.

# Uso de Almacenamiento

- Los usuarios del cluster IALAB tienen acceso a ciertos tipos de almacenamiento con cuotas máximas de uso:
  - **Home**: almacenamiento pequeño y personal. Pensado para guardar código y ambientes virtuales. Cuota de 10 GB por usuario.
  - **Workspaces**: almacenamiento de alta velocidad temporal y particular a cada nodo. Los datos de entrenamiento leídos por un experimento deben ser almacenados en este tipo de almacenamiento.
  - **NAS**: almacenamiento de baja velocidad pero mayor capacidad. Accesible a través del directorio **storage** en el home. Cuota de 200 GB máximo por usuario.
  - Estas directrices de almacenamiento son claves para el buen funcionamiento del cluster, por lo que se harán cumplir estrictamente.
- Se puede solicitar un aumento temporal en la cuota de almacenamiento. Éste durará por un semestre o a discreción del equipo de administración si es que existen requisitos de almacenamiento de otros usuarios. Al final del semestre se consultará con el usuario si sigue requiriendo el espacio. En caso de no responder en 14 días, se asumirá que la cuota no es necesaria y se revertirá a la cuota por defecto.
- Sólo se deben almacenar datos relevantes para proyectos activos.
- No se deben guardar datasets redundantes ni archivos de salida innecesarios.
- Se recomienda comprimir y organizar archivos para optimizar el espacio (tar.gz, zip).

# Borrado de información

- La información contenida en los Workspaces se borrará cada semestre automáticamente.
- La información contenida en los NAS no se borrará. Sin embargo, si por alguna razón un usuario está ocupando más espacio que el permitido por su cuota (por ejemplo, tras haber pedido una cuota mayor y luego ésta fue reducida), se le enviará un correo indicando que debe borrar información para estar bajo la cuota. Si tras 14 días la violación de cuota persiste, se dará aviso al usuario y a su Supervisor de que en 7 días se borrará toda la información del usuario del NAS.
- Será responsabilidad del usuario asegurarse de que sus datos no sean borrados, dadas estas políticas.
 
# Penalizaciones por Incumplimiento

- Los administradores del cluster pueden suspender el acceso de un usuario que no cumpla con estas políticas.
- El uso excesivo e injustificado de recursos sin previa coordinación puede resultar en restricciones de acceso.
- El almacenamiento de datos innecesarios o en ubicaciones inadecuadas puede derivar en la eliminación automática de archivos sin previo aviso.
- Por cada violación de política que incurra una penalización pasará lo siguiente:
  - Si es la primera penalización, se cancelará el trabajo si no ha terminado y se dará una advertencia junto con un link a la guía de uso de Slurm.
  - Para la segunda, se bloqueará su acceso al cluster por una semana y se dará aviso al Supervisor.
  - Después de la segunda penalización, se bloqueará el acceso al cluster por una cantidad de tiempo más extensa, con potencial cancelación de la cuenta en los casos más graves.

# Resolución de Problemas
- Si un nodo presenta fallos, se debe notificar a los administradores en lugar de intentar reiniciarlo o modificar su configuración.
- Comunicar con los demás usuarios antes de ejecutar experimentos largos que puedan afectar la disponibilidad.
- El canal oficial para comunicarse con otros usuarios del cluster es el grupo oficial de Telegram.
- Si un nodo presenta fallos, se debe notificar a los administradores a través del canal oficial para esto (tickets).
- En caso de consultas, mirar la sección de [Preguntas Frecuentes](https://github.com/rconcenia/documentacion-cenia/wiki/FAQ-%E2%80%90-Preguntas-Frecuentes) y en caso de no encontrarse ahí la respuesta, consultar en el canal de Telegram.


