# Políticas de SLURM

Debido a la diversidad de cargas de trabajo existentes en el clúster, se ha definido una política de uso de recursos que establece las condiciones bajo las cuales los usuarios pueden ejecutar sus trabajos.

La política busca distribuir los recursos de manera equilibrada entre los usuarios, priorizando los trabajos de corta duración y menor consumo de recursos, al mismo tiempo que considera el uso histórico de cada usuario para evitar una utilización desproporcionada de los recursos disponibles.

A continuación, se describen las particiones, colas de trabajo (QoS) y mecanismos de priorización utilizados por Slurm.

## Particiones

Las particiones son la forma en que se agrupan los nodos del clúster de acuerdo con sus características y capacidades. Cada partición define un conjunto de nodos sobre los cuales pueden ejecutarse los trabajos asociados a ella.

En el clúster se han definido las siguientes particiones:

| **Partición**      | **Nodos**                                 |
| ------------------ | ----------------------------------------- |
| `ialab-high`       | antuco, llaima                            |
| `ialab-low`        | ahsoka, hydra, scylla, ventress, yodaxico |
| `ialab-high-unlim` | antuco, llaima                            |
| `ialab-low-unlim`  | ahsoka, hydra, scylla, ventress, yodaxico |

Las particiones `ialab-high` e `ialab-low` poseen límites de recursos definidos para controlar la cantidad de CPU y memoria que puede utilizar un trabajo en función de las GPUs solicitadas.

Las particiones `ialab-high-unlim` e `ialab-low-unlim` están destinadas a trabajos que requieren una mayor cantidad de recursos y, por lo tanto, no poseen los mismos límites máximos de CPU y memoria establecidos en sus respectivas particiones limitadas.

### Relación entre GPUs, CPU y memoria

En las particiones con límites definidos, la cantidad de GPUs solicitadas por un trabajo determina también la cantidad de CPU y memoria que este podrá utilizar de acuerdo con la configuración de la partición.

Por ejemplo, en `ialab-low`, donde se establecen 4 CPU y 20 GB de memoria por GPU, un trabajo que solicite 2 GPUs podrá disponer de hasta 8 CPU y 40 GB de memoria, siempre respetando los límites máximos definidos para el nodo.

Por este motivo, la cantidad de GPUs solicitadas por un trabajo no debe considerarse únicamente como un límite de aceleradores, ya que también afecta la cantidad de CPU y memoria que puede utilizar.

## Colas de trabajo (QoS)

Las colas de trabajo son el mecanismo utilizado por Slurm para clasificar y gestionar los trabajos enviados al clúster de acuerdo con distintas políticas de ejecución. Estas se implementan mediante **Quality of Service (QoS)**, que permiten establecer diferentes condiciones y restricciones para los trabajos asociados a cada cola.

Cada QoS define parámetros como el tiempo máximo de ejecución, la cantidad de recursos que puede utilizar un trabajo, la cantidad de trabajos que un usuario puede ejecutar simultáneamente y la prioridad asociada a la cola.

En el clúster se han definido las siguientes colas de trabajo:

| **QoS**   | **Límite<br>de tiempo** | **Máx. GPUs<br>por job** | **Máx. jobs<br>simultáneos** | **Máx.<br>submits** | **Particiones**                       | **Prioridad** |
| --------- | ----------------------- | ------------------------ | ---------------------------- | ------------------- | ------------------------------------- | ------------- |
| `debug`   | 1 hora                  | 4                        | 1                            | 4                   | `ialab-low-unlim`<br>`ialab-high-unlim` | Alta        |
| `regular` | 24 horas                | 4                        | 4                            | 32                  | `ialab-low`<br>`ialab-high`             | Media       |

## Accounts

En Slurm, los accounts permiten asociar los trabajos a una cuenta determinada para efectos de administración, seguimiento y aplicación de políticas de uso de recursos.

En el clúster, todos los usuarios pertenecen al account `default-account`. Por lo tanto, este debe ser especificado al momento de enviar los trabajos.

Para trabajos enviados mediante scripts, se debe indicar el account utilizando la directiva `#SBATCH`:

```bash
#SBATCH --account=default-account
```

En el caso de utilizar `srun` directamente, se debe especificar mediante el parámetro correspondiente:

```bash
srun --account=default-account ...
```

Se recomienda incorporar esta configuración en todos los trabajos para asegurar que Slurm pueda asociarlos correctamente al account correspondiente.

## Priorización de trabajos

La priorización de los trabajos se realiza mediante el **[Multifactor Priority Plugin](https://slurm.schedmd.com/priority_multifactor.html)** de Slurm. Este mecanismo calcula una prioridad para cada trabajo utilizando distintos factores, los cuales determinan qué trabajos tienen mayor probabilidad de ser seleccionados para su ejecución cuando los recursos se encuentran disponibles.

La prioridad no depende de un único criterio. Slurm combina diferentes factores para determinar la prioridad final de cada trabajo.

Los factores considerados dentro de la política definida para el clúster son:

* **Age Factor**: considera el tiempo que el trabajo lleva esperando en la cola. Mientras más tiempo permanece en estado `PENDING`, mayor es su aporte a la prioridad.
* **Job Size Factor**: considera la cantidad de recursos solicitados por el trabajo. En esta política se favorece a los trabajos que solicitan menos recursos.
* **Fair-Share Factor**: considera el uso histórico de recursos del usuario. Mientras más recursos ha consumido respecto de los demás usuarios, menor es este factor.
* **QoS Factor**: corresponde a la prioridad asociada a la cola de trabajo (QoS) seleccionada para ejecutar el trabajo.

Los pesos definidos inicialmente para estos factores son:

| **Factor** | **Peso**  | **Peso relativo aproximado** |
| ---------- | --------- | ---------------------------- |
| Age        | 1.000     | 0,09 %                       |
| Job Size   | 10.000    | 0,90 %                       |
| Fair-Share | 100.000   | 9,00 %                       |
| QoS        | 1.000.000 | 90,01 %                      |

La prioridad final se obtiene conceptualmente mediante la combinación de estos factores:

```text
Job_Priority =
    (1000 * Age_Factor)
  + (10000 * Job_Size_Factor)
  + (100000 * FairShare_Factor)
  + (1000000 * QOS_Factor)
```

Los valores utilizados por cada factor son calculados internamente por Slurm y pueden variar según las características y el historial de utilización de cada trabajo y usuario.

### Factor de edad (Age Factor)

El factor de edad considera el tiempo que un trabajo permanece en estado `PENDING` desde el momento en que fue enviado. A medida que aumenta el tiempo de espera, también aumenta su contribución al cálculo de prioridad.

En esta política, el factor de edad posee una influencia relativamente baja frente a los demás factores. Su objetivo es evitar que un trabajo permanezca indefinidamente en espera, pero sin desplazar de forma significativa a trabajos pertenecientes a colas con una prioridad superior.

Se establece inicialmente un peso de:

```text
PriorityWeightAge = 1000
```

El factor comenzará a tener una mayor influencia a medida que el trabajo acumule tiempo de espera, especialmente después de períodos prolongados en estado `PENDING`.

### Factor de tamaño del job (Job Size Factor)

El factor de tamaño considera la cantidad de recursos solicitados por un trabajo.

En la política definida para el clúster, se busca otorgar una mayor prioridad relativa a los trabajos que requieren una menor cantidad de recursos.

Esto permite favorecer la ejecución de trabajos pequeños, particularmente aquellos asociados a la cola `debug`. De esta forma, trabajos que requieren pocos recursos pueden entrar y finalizar rápidamente sin tener que esperar necesariamente a que exista suficiente capacidad disponible para trabajos de mayor tamaño.

Este factor posee un peso de:

```text
PriorityWeightJobSize = 10000
```

Por lo tanto, entre trabajos con características similares, aquellos que requieran una menor cantidad de recursos podrán obtener una prioridad relativa superior.

### Factor de Fair-Share

El factor de Fair-Share permite considerar el uso histórico de recursos realizado por los usuarios al determinar la prioridad de sus trabajos.

A medida que un usuario utiliza una mayor cantidad de recursos respecto de los demás usuarios, su factor de Fair-Share disminuye y, por lo tanto, sus nuevos trabajos pueden recibir una menor prioridad.

El objetivo de este mecanismo es distribuir de manera más equitativa los recursos del clúster, evitando que un usuario que haya utilizado una cantidad considerable de recursos tenga una ventaja permanente sobre aquellos que han tenido un menor nivel de utilización.

Este factor posee un peso de:

```text
PriorityWeightFairshare = 100000
```

Por lo tanto, el uso histórico de recursos tendrá una influencia considerable en la prioridad de los trabajos.

Un usuario que utilice recursos de manera intensiva durante un período determinado verá reducida progresivamente la prioridad asociada al Fair-Share de sus trabajos posteriores.

### Recuperación de prioridad mediante Half-Life Decay

Para evitar que el historial de utilización afecte permanentemente la prioridad de un usuario, Slurm utiliza el mecanismo **Half-Life Decay**.

Este mecanismo permite reducir progresivamente la influencia del uso histórico sobre el Fair-Share.

La configuración considerada para esta política establece un período de recuperación de 7 días.

Por ejemplo, si el uso considerado para un usuario corresponde a 1.000 horas de GPU y posteriormente deja de utilizar recursos, su influencia histórica se reducirá progresivamente:

```text
Semana 1: 1000 horas
Semana 2:  500 horas
Semana 3:  250 horas
Semana 4:  125 horas
...
```

Esto no significa que se elimine completamente el historial cada siete días. En cambio, la influencia del uso acumulado se reduce a la mitad durante cada período de Half-Life.

De esta manera, un usuario que haya utilizado muchos recursos podrá recuperar progresivamente su prioridad si posteriormente reduce su consumo.

### Actualización del cálculo de prioridad

El período de Half-Life y la frecuencia con la que Slurm recalcula la prioridad son mecanismos diferentes.

El **Half-Life Decay** determina cuánto tarda en reducirse la influencia del uso histórico, mientras que `PriorityCalcPeriod` determina cada cuánto tiempo se realizan los cálculos relacionados con la prioridad.

Para esta política se considera:

```text
PriorityCalcPeriod = 5 minutos
```

Por lo tanto, los factores que determinan la prioridad pueden ser recalculados periódicamente. Como consecuencia, la prioridad de un trabajo que se encuentra actualmente en estado `PENDING` puede cambiar mientras permanece en la cola.

### Factor de cola de trabajo (QoS Factor)

El factor de QoS corresponde al valor de prioridad asociado a la cola de trabajo seleccionada para ejecutar un trabajo.

Cada QoS posee una prioridad determinada de acuerdo con las necesidades que busca cubrir dentro de la política del clúster.

En esta política:

* `debug` posee una prioridad superior.
* `regular` posee una prioridad inferior.

Por este motivo, los usuarios deben seleccionar la cola que mejor se adapte a las características de su trabajo.

La elección de una QoS determina tanto las restricciones de ejecución del trabajo como su prioridad relativa frente a otros trabajos que se encuentren esperando recursos.

El peso definido para este factor es:

```text
PriorityWeightQOS = 1000000
```

Debido a su elevado peso, la QoS seleccionada constituye actualmente el factor con mayor influencia sobre la prioridad final de un trabajo.

## Solicitud de recursos computacionales adicionales

En caso de requerir una cantidad de recursos superior a los límites establecidos para las colas o particiones disponibles, se deberá consultar el procedimiento correspondiente para la [Solicitud de Recursos Adicionales](../../additional_resources).

La administración del clúster revisará la solicitud de acuerdo con las necesidades del trabajo y la disponibilidad de recursos, de ser aceptada, se enviarán los pasos para ocupar la reserva de recursos.
