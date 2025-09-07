## ¿Cómo acceder al clúster?

Si no sabes cómo acceder al clúster, por favor revisa la página de [Instrucciones SSH](https://github.com/rconcenia/documentacion-cenia/wiki/Uso-de-SSH)

## Arquitectura del clúster

El clúster cuenta con un nodo front-end que cumple funciones administrativas llamado kraken (`kraken.ing.puc.cl`). Idealmente deberías ser capaz de realizar el 100% de tus tareas en CENIA desde este nodo sin necesidad de acceder por SSH a otros nodos.

Es de suma importancia mencionar que **no está permitido correr código o workloads de IA en kraken.** Hacer esto podría resultar en la suspensión o revocación de tu acceso al clúster.

El clúster actualmente cuenta con 5 nodos de cómputo (ahsoka, hydra, scylla, ventress, yodaxico). Estos nodos cuentan con GPUs y procesadores destinados a tareas de entrenamiento de IA.

Para saber cómo utilizarlos puedes seguir las instrucciones presentes en la sección SLURM.

## Almacenamiento

Todos los usuarios cuentan con 3 formas de almacenar datos en el clúster:

### **Home**

Tiene como ruta absoluta `/home/<username>/` y también es accesible por `~/`. Es el directorio en el que te situas por defecto al conectarte al clúster.

Es compartido entre todos los nodos del clúster. Es decir, todos los nodos (kraken y nodos de cómputo) verán los mismos archivos en la ruta de tu home.

Está destinado al almacenamiento de archivos pequeños como scripts y workspaces de VS Code, por ejemplo.

El home de cada usuario tiene una cuota de 10GB. Si la sobrepasas no podrás escribir más datos a tu home y posiblemente tengas dificultades para conectarte al clúster por SSH. Puedes ver qué archivos usan almacenamiento en tu home con el comando

`ncdu ~`

### Storage

En tu home podrás encontrar un directorio llamado `storage` sujeto a una cuota más grande de 200GB. Aquí puedes almacenar entornos virtuales, datasets, modelos entrenados, etc.

Si quieres instalar una herramienta para almacenar entornos virtuales y sus librerías (pyenv, anaconda, miniconda) fíjate en ingresar `~/storage` como directorio de instalación al correr el script pertinente. De lo contrario, es posible que alcances la cuota de tu home con entornos virtuales y librerías instaladas por `pip`.

Puedes ver el uso de almacenamiento de tu storage con

`ncdu ~/storage`

### Workspaces

Los workspaces son discos de almacenamiento locales a los nodos de cómputo y son el único almacenamiento que se tiene permitido usar para la carga de datos (datasets, pesos) en tareas de entrenamiento.

Puedes acceder a ellos remotamente desde kraken en el directorio `/workspaces`

Los workspaces de cada nodo se pueden identificar como `/workspaces/<nodo>-workspaceN`

Por ejemplo, si la ruta de un workspace en kraken es `/workspaces/ahsoka-workspace1`

Su ruta local en el nodo ahsoka sería `/workspace1`

**Importante:** Una vez que termines de usar un workspace, ya sea porque terminaste de entrenar un modelo, un experimento, magíster o doctorado es TU responsabilidad eliminar los datos y liberar el espacio utilizado.

## **Comandos útiles**

- `df -h`: mostrar espacio disponible en los sistemas de archivos
- `du <ruta>`: consultar peso de un directorio o archivo
- `btop`: administrador de tareas con interfaz de terminal
- `nvtop`:
- `tmux`
- `scp`

**SLURM**

Qué es y para qué se usa

Comandos útiles

- `squeue`
- `sinfo`
- `sq`
- `sq2`
- `sfree`
- `stail`
- `serror`

Modo de uso

- Cómo armar el script de slurm
- Cómo crear un virtualenv y usarlo para mi job
- Buenas y malas prácticas
- Cómo enviar la tarea

**Bonus: Algunos tips de cómo yo trabajo**

- La utilidad de usar un archivo `sync.sh`
- Comportamiento diferenciado segun nodo, dentro de SLURM
- Cómo correr varios scripts en una misma GPU
- Configurar alias para simplificar comandos típicos
- Vaciar caché en el home del cluster