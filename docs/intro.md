## ¿Cómo acceder al clúster?

Si no sabes cómo acceder al clúster, por favor revisa la página de [Instrucciones SSH](https://github.com/Sysadmins-CENIA/Cluster-IALab-Docs/wiki/Uso-de-SSH)

## Arquitectura del clúster

El clúster cuenta con un nodo front-end que cumple funciones administrativas llamado kraken (`kraken.ing.puc.cl`). Idealmente deberías ser capaz de realizar el 100% de tus tareas en CENIA desde este nodo sin necesidad de acceder por SSH a otros nodos.

Es de suma importancia mencionar que **no está permitido correr código o workloads de IA en kraken.** Hacer esto podría resultar en la suspensión o revocación de tu acceso al clúster.

El clúster actualmente cuenta con 5 nodos de cómputo (ahsoka, hydra, scylla, ventress, yodaxico). Estos nodos cuentan con GPUs y procesadores destinados a tareas de entrenamiento de IA.

Para saber cómo utilizarlos puedes seguir las instrucciones presentes en la sección SLURM.

![alt](https://raw.githubusercontent.com/Sysadmins-CENIA/Cluster-IALab-Docs/45b8d419b51146632de6ff135c9ce7696c400d8f/IALAB-CLUSTER.png)

**SLURM**

¿Qué es? y ¿para qué se usa?

En palabras simples Slurm es un administrador de recursos, de codigo abierto y altamente escalable,es el quien te permitirá lanzar los trabajos dentro de los nodos de computo.

Se usa para la gestion y planificación de trabajos. Cuenta con 3 funciones claves:

 -1. Asignar Recursos a los trabajos de los usuarios por un periodo de tiempo.

 -2. Proporcionar un ambiente para ejecutar trabajos (ejecutar, supervisar y finalizar tareas en los nodos).

 -3. Gestiona una cola de trabajos pendientes para determinar cuando se ejecutará un trabajo.


# Comandos Útiles del Cluster

| Comando | Descripción | Uso |
|---------|-------------|-----|
| `squeue` | Obtiene información sobre trabajos en la cola de Slurm | `squeue -u $USER` |
| `sinfo` | Estado de particiones y nodos del cluster | `sinfo` |
| `sq` | Información detallada de memoria, GPU y CPUs asignados | `sq` |
| `sfree` | Disponibilidad de nodos (CPUs, RAM, GPUs) | `sfree` |
| `stail` | Muestra últimas líneas del archivo de salida de un job | `stail <JOBID>` |
| `sshow + JOBID` | Información detallada de asignación de recursos y tiempo restante | `sshow <JOBID>` |
| `sshow + Nodo` | Estado y capacidad de hardware de un nodo específico | `sshow <nodo>` |
| `serror + JOBID` | Muestra últimas 1000 líneas del archivo de error de un job | `serror <JOBID>` |
