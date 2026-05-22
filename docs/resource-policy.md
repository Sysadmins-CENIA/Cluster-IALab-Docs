#  Políticas de Solicitud y Asignación de Recursos del Cluster de Inteligencia Artificial

## 1. Introducción y Marco General

### 1.1 Propósito
El presente documento tiene como finalidad establecer los **procedimientos, criterios de elegibilidad y normativas** para la solicitud, evaluación y asignación justa y eficiente de los recursos computacionales de alto rendimiento (**GPU, CPU, RAM, Storage**) que componen el **Cluster de Inteligencia Artificial de CENIA**. Esto asegura la maximización del retorno de inversión del hardware y el soporte prioritario a la investigación estratégica.

### 1.2 Alcance
Esta política es de **cumplimiento obligatorio** para todo el personal investigador de CENIA (Investigadores Principales, Postdoctorados, Estudiantes de Doctorado) y colaboradores externos formalmente asociados a proyectos de CENIA, que requieran el uso de recursos computacionales del Cluster.

---

## 2. Definiciones Clave

| Término | Definición |
| :--- | :--- |
| **Cluster de IA** | Conjunto de nodos interconectados de alto rendimiento gestionados por CENIA para tareas de IA/HPC. |
| **Nodo (Node)** | Una máquina física dentro del Cluster, que contiene un conjunto específico de recursos (ej. 8×A100, 512 GB RAM). |
| **Job / Tarea** | Unidad de trabajo computacional definida y enviada al sistema de cola (scheduler) para su ejecución en el Cluster. |
| **Utilización de GPU (Utilization)** | Porcentaje de tiempo que la unidad de procesamiento gráfico está activamente realizando cálculos. Es un indicador clave de eficiencia. |
| **Tiempo Continuo** | El periodo de tiempo **ininterrumpido** requerido para la ejecución de una Tarea. |
| **Full Fine-Tuning (Full FT)** | Entrenamiento de todos los parámetros de un modelo, lo cual requiere alta capacidad de VRAM y tiempo. |
| **PEFT** | Parameter-Efficient Fine-Tuning (ej. LoRA). Métodos que modifican solo un subconjunto de parámetros, consumiendo menos recursos que Full FT. |

---

## 3. Responsabilidades

### 3.1 Equipo Solicitante
Es responsabilidad del **Investigador Principal**:

* Completar el [Formulario **F-SRCIA-001**](https://forms.gle/cm7PKZGuexncfa857) de manera **veraz, precisa y completa**.
* Asegurar que el código y el job estén **optimizados** antes de la solicitud (pruebas locales, Pruebas de Concepto (PoC)).
* **Monitorear activamente** su job una vez asignado y asegurar su terminación o liberación una vez finalizado el proceso.
* Monitorear el uso de recursos.
* Solicitar Hardware ajustado a los requerimientos para **evitar la subutilización**.
* Notificar formalmente al equipo del Cluster inmediatamente después de finalizar mi uso de los recursos, con el fin de liberar el hardware para otros investigadores.

### 3.2 Equipo Sysadmin (Administración del Cluster)
Es responsabilidad del **Equipo Sysadmin**:

* Evaluar la **viabilidad técnica** y la **Prioridad** de cada solicitud.
* Asignar el **Nodo específico** y el tiempo en el sistema de cola.
* Garantizar la **estabilidad y disponibilidad** del hardware.
* Monitorear el uso de los recursos y aplicar las normas de **suspensión por subutilización**.

---



## 4. Justificación Técnica Requerida

### 4.1 Requisitos de Hardware (GPU/VRAM)
El solicitante debe especificar el **Número de Unidades GPU**, el **Modelo Exacto** (ej. A100, A40) y la **Memoria VRAM Mínima** requerida para el job. Esta especificación debe ser **críticamente justificada**.

> **Ejemplo de Justificación Válida:** "Se requieren 8 ×A100 40GB para acomodar un batch size de 128 utilizando Full FT del modelo LLaMA-70B, lo cual no es posible con tarjetas de 24GB debido a limitaciones de memoria de gradientes."

### 4.2 Justificación de Método
Si el método solicitado (ej. Full Fine-Tuning) consume significativamente más recursos que un método alternativo (**PEFT**), el solicitante debe adjuntar **evidencia científica o técnica** que demuestre que la alternativa ya ha sido agotada o que introduce limitaciones insuperables.

> **Cita de Ejemplo:** "Hemos agotado las optimizaciones con LoRA y requerimos el Full FT debido a la evidencia de 'intruder dimensions' que limitan el rendimiento máximo alcanzable, según literatura reciente (Nature 2024)."

## 5. Proceso de Asignación del Sysadmin

El Equipo Sysadmin seguirá estos pasos internos para la asignación:

1.  **Recepción y Validación:** Revisar el Formulario **F-SRCIA-001** y clasificar la Prioridad (P1, P2 o P3).
2.  **Reunión de coordinación**
3.  **Mapeo de Hardware:** Identificar un **Nodo Específico** dentro del Cluster (ej. NODO-ALPHA-03 o NODO-BETA-05) cuyas especificaciones (GPU,RAM) cumplan o superen los requisitos del proyecto.
4.  **Posible periodo de prueba**
5.  **Programación de Job:** El job será ingresado al sistema de cola (scheduler) con el **Tiempo Continuo máximo solicitado**. Si hay conflicto de tiempo, se aplicará el criterio de Prioridad y Flexibilidad.

## 6. Normas de Ejecución (Timing y Extensión)

### 6.1 Límite de Tiempo Continuo
La ejecución del job asignado estará estrictamente limitada al **Tiempo Continuo aprobado**. El scheduler detendrá automáticamente la tarea al alcanzar este límite.

### 6.2 Solicitud de Extensión
Toda solicitud de extensión debe presentarse al Equipo Sysadmin con un mínimo de **24 horas de antelación** al vencimiento del job. La solicitud debe incluir una justificación técnica precisa del tiempo adicional requerido. Las extensiones están sujetas a la **disponibilidad del Nodo** y no tienen garantía de aprobación inmediata.

## 7. Monitoreo y Subutilización

### 7.1 Monitoreo Obligatorio
Todos los jobs en ejecución serán monitoreados activamente por el Equipo Sysadmin para asegurar la estabilidad y el **uso eficiente de los recursos**.

### 7.2 Advertencias por Subutilización
Se define la **Subutilización** como el uso promedio de **GPU Utilization < 10%** en el nodo asignado, mantenido de forma continua por un periodo superior a **4 horas**.

* Si se detecta Subutilización, el Sysadmin emitirá una **advertencia**.
* Si el uso no se corrige en las siguientes **2 horas**, el job será **pausado o terminado** sin derecho a reasignación inmediata.

## 8. Flexibilidad y Ventanas de Mantenimiento

### 8.1 Prioridad por Flexibilidad
Los proyectos que indiquen **alta flexibilidad horaria** (disponibilidad para ejecutar en horarios nocturnos, fines de semana, o días feriados) serán **priorizados** en la cola de asignación para optimizar el uso del Cluster fuera del horario laboral (09:00 - 18:00 hrs).

### 8.2 Mantenimiento Planificado
El Equipo Sysadmin se reserva el derecho de programar **ventanas de mantenimiento planificado** con **48 horas de aviso**. Todos los jobs deben ser detenidos o migrados por el equipo solicitante antes de este periodo para evitar la corrupción de datos o checkpoints.
