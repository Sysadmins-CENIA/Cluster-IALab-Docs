# Políticas de SLURM

Debido a la diversidad de cargas de trabajo existentes en el clúster, se ha definido una política de uso de recursos que establece las condiciones bajo las cuales los usuarios pueden ejecutar sus trabajos.

A continuación, se describen las particiones, colas de trabajo (QoS) y mecanismos de priorización utilizados por Slurm.

## Particiones

Las particiones son la forma en que se agrupan los nodos del clúster de acuerdo con sus características y capacidades. Cada partición define un conjunto de nodos sobre los cuales pueden ejecutarse los trabajos asociados a ella.

En el clúster se han definido las siguientes particiones:

| **Partición** | **Nodos** |
| ------------- | --------- |
| cenia | antuco, llaima |
| ialab	| ahsoka, hydra, scylla, ventress, yodaxico |

## Colas de trabajo (QoS)

Las colas de trabajo son el mecanismo utilizado por Slurm para clasificar y gestionar los trabajos enviados al clúster de acuerdo con distintas políticas de ejecución. Estas se implementan mediante Quality of Service (QoS), que permiten establecer diferentes condiciones y restricciones para los trabajos asociados a cada cola.

Cada QoS define parámetros como el tiempo máximo de ejecución, la cantidad de recursos que puede utilizar un trabajo, la cantidad de trabajos que un usuario puede ejecutar simultáneamente, la prioridad y las condiciones de preempción.

En el clúster se han definido las siguientes colas de trabajo:

| **QoS** | **Límite de tiempo** | **Máx. GPUs por job** | **Máx. jobs simultáneos** | **Particiones** | **Prioridad** | **Preempción** | **Protección contra preempción** |
| ------- | -------------------- | --------------------- | ------------------------- | --------------- | --------------| -------------- | -------------------------------- |
| debug	| 1 hora | 4 | 1 | cenia, ialab | Alta | No | N/A |
| regular | 24 horas | 4 | 4 | cenia, ialab | Media | No | N/A |
| long | 72 horas | Sin límite | 4 | cenia, ialab | Media | Sí | 2 horas desde el inicio del job |
| reserved | Configurable | Sin límite | Sin límite | Cualquiera | Alta | No | N/A |


## Priorización de jobs

La priorización de los trabajos se realiza mediante el Priority Multifactor Plugin de Slurm. Este mecanismo calcula una prioridad para cada trabajo utilizando distintos factores, los cuales determinan qué trabajos tienen mayor probabilidad de ser seleccionados para su ejecución cuando los recursos se encuentran disponibles.

Los principales factores considerados dentro de la política definida para el clúster son los siguientes.

### Factor de edad (Age Factor)

El factor de edad considera el tiempo que un trabajo permanece en estado PENDING desde el momento en que fue enviado. A medida que aumenta el tiempo de espera, también aumenta su contribución al cálculo de prioridad.

En esta política, el factor de edad permite evitar que un trabajo permanezca indefinidamente en espera debido a la existencia de otros trabajos con una prioridad inicialmente superior. De esta manera, los trabajos que llevan más tiempo esperando tienen progresivamente una mayor posibilidad de ser seleccionados para su ejecución.

### Factor de tamaño del job (Job Size Factor)

El factor de tamaño considera la cantidad de recursos solicitados por un trabajo. En la política definida para el clúster, se busca otorgar una mayor prioridad relativa a los trabajos que requieren una menor cantidad de recursos.

Esto permite favorecer la ejecución de trabajos pequeños, particularmente aquellos asociados a la cola debug, que está limitada a una cantidad reducida de recursos y tiempo de ejecución. De esta forma, estos trabajos pueden entrar y finalizar rápidamente, evitando mantener recursos ocupados durante períodos prolongados y reduciendo los tiempos de espera.

### Factor de Fair-Share

El factor de Fair-Share permite considerar el uso histórico de recursos realizado por los usuarios al determinar la prioridad de sus trabajos. Este factor se calcula mediante el algoritmo FairTree de Slurm.

La política considera el consumo de recursos durante un período de un mes. A medida que un usuario utiliza una mayor cantidad de recursos respecto de los demás usuarios, su factor de Fair-Share disminuye y, por lo tanto, sus nuevos trabajos pueden recibir una menor prioridad.

El objetivo de este mecanismo es distribuir de manera más equitativa los recursos del clúster, evitando que un usuario que haya utilizado una cantidad considerable de recursos tenga una ventaja permanente sobre aquellos que han tenido un menor nivel de utilización.

### Factor de cola de trabajo (QoS Factor)

El factor de QoS corresponde al valor de prioridad asociado a la cola de trabajo seleccionada para ejecutar un trabajo. Cada QoS posee una prioridad determinada de acuerdo con las necesidades que busca cubrir dentro de la política del clúster.

Por este motivo, los usuarios deben seleccionar la cola que mejor se adapte a las características de su trabajo. La elección de una QoS no solo determina las restricciones de ejecución del trabajo, sino que también puede influir en su prioridad frente a otros trabajos que se encuentren esperando recursos.