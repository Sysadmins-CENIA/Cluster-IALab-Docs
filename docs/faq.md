# FAQ: Cluster IALab - Preguntas Frecuentes

Esta sección contiene las respuestas a las dudas más comunes sobre el uso y operación del Cluster IALab.

## Conceptos Básicos y Acceso

**1-. ¿Por qué no puedo acceder al clúster?** 

Si tu sesión es rechazada, es probable que hayas excedido la cuota de almacenamiento de tu home. Envía un ticket de soporte CENIA (detallado en el [soporte@cenia.cl](mailto:soporte@cenia.cl) para revisar tu situación.

**2-. ¿Qué es el nodo Kraken?** 

Es el nodo de gestión (headnode). Úsalo solo para organizar archivos y lanzar tareas; no ejecutes cálculos pesados aquí.

**3-. ¿Cómo accedo al cluster?** 

Debes conectarte vía SSH a través del nodo *Kraken* utilizando tus credenciales.

**4-. ¿Cómo solicito acceso inicial?** 

Contacta al equipo de administración a través de los canales oficiales del laboratorio.

**5-. ¿Qué es el "Cluster"?**

Es un conjunto de computadoras interconectadas que trabajan como una unidad para procesar tareas científicas masivas.


## Uso de Recursos, Slurm y Memoria

**6-. ¿Cómo envío un trabajo al cluster?** 

Utiliza el comando `sbatch` seguido de tu script de ejecución configurado para *Slurm*. Todo trabajo enviado directamente al nodo sin pasar por Slurm será cancelado automáticamente.

**7-. ¿Cómo verifico el estado de mis trabajos?** 

Usa `squeue -u <tu_usuario>` para ver la lista de tus procesos activos.

**8-. ¿Cómo cancelo un trabajo?** 

Usa `scancel <job_id>` para detener un proceso.

**9-. ¿Qué significa que un trabajo esté en estado "PENDING"?** 

Significa que está en cola esperando recursos (CPU/GPU) o que no hay nodos disponibles.

**10-. ¿Existe un límite de tiempo por ejecución?** 

Sí, el límite máximo es de 24 horas por trabajo.

**11-. ¿Qué pasa si mi trabajo se excede de las 24 horas?** 

El sistema lo terminará automáticamente. Implementa *checkpoints* en tu código.

**12-. ¿Qué pasa si no especifico memoria en mi script?** 

Si no defines el parámetro `--mem`, el sistema asignará por defecto 4GB de RAM por cada CPU solicitada.

**13-. ¿Cuál es el máximo de memoria RAM que puedo asignar?** 

El límite máximo estipulado por cada trabajo en el IALab es de 128 GB de memoria RAM.

**14-. ¿Existe un límite en la cantidad de CPUs a solicitar?** 

Sí. Si no utilizas el flag `--mem` para definir una memoria específica, el límite máximo de CPUs que puedes solicitar es de 33. Esto evita que el cálculo automático de memoria (4GB por CPU) exceda el límite total de 128 GB del clúster por trabajo.

## Hardware y Nodos (NVIDIA vs AMD)

**15-. ¿Cuáles son los nodos con GPU NVIDIA?** 

Son *Hydra, Scylla, Llaima, Ahsoka* y *Yodaxico*.

**16-. ¿Es obligatorio usar contenedores en el nodo Antuco?** 

No es un requisito estricto, pero es altamente recomendado. La arquitectura de AMD (ROCm) requiere librerías muy específicas y dependencias que suelen entrar en conflicto con el entorno local del usuario. Utilizar un contenedor asegura la compatibilidad con el hardware.

**17-. ¿Cómo solicito una GPU específica en mi script?** 

Usa la directiva `#SBATCH --gres=gpu:1` en tu script.

**18-. ¿Puedo elegir en qué nodo ejecutar específicamente?** 

**Sí, puedes usar `--nodelist=nombre_nodo`, aunque se recomienda dejar que *Slurm* gestione la carga.

## Gestión de Archivos, Espacio y Workspaces

**19-. ¿Dónde debo guardar mis archivos?** 

Utiliza directorios de usuario (home) o volúmenes compartidos. 

**20-. ¿Cómo uso los workspaces?** 

Cada nodo tiene almacenamiento local en `/workspace1`. Es el **único** lugar permitido para entrenar. Está prohibido entrenar leyendo/escribiendo en tu `home` o `storage`. Copia tus datos desde `storage` al workspace del nodo (ej: `/workspaces/ahsoka-workspace1/<usuario>`) desde *Kraken*. Si el directorio no existe, solicítalo a [soporte@cenia.cl](mailto:soporte@cenia.cl). Limpia el espacio al terminar.

**21-. ¿Qué es el directorio `/scratch` y cómo lo uso?** 

Es almacenamiento temporal de alto rendimiento. Úsalo para cálculos, pero mueve los resultados a tu `/home` al finalizar.

**22-. ¿Cómo transfiero archivos desde mi PC local al cluster?** 

Usa `scp` o `rsync`. Ejemplo: `rsync -avz mi_proyecto/ usuario@kraken:/home/usuario/`.

**23-. ¿Qué hago si me quedo sin espacio en disco?** 

Revisa tu uso con `du -sh *` y elimina archivos temporales o logs antiguos.

**24-. ¿Los archivos en el cluster están respaldados?** 

No existe backup automático. Mantén copias de resultados críticos fuera del cluster.

**25-. ¿Puedo compartir datos con otros usuarios?** 

Sí, utiliza directorios de grupo con permisos de lectura (`chmod g+r`).

## Entorno de Software y Contenedores

**26-. ¿Puedo usar Docker?** 

Sí, pero el uso de Docker en nodos de cómputo debe ser autorizado previamente. Envía un ticket a [soporte@cenia.cl](mailto:soporte@cenia.cl) para evaluar tu caso.

**27-. ¿Por qué debo ejecutar mis contenedores a través de Slurm?** 

Es estrictamente obligatorio porque Slurm garantiza que tu contenedor tenga acceso exclusivo y seguro al hardware (GPU/CPU/RAM) asignado. Ejecutar fuera de Slurm compromete la estabilidad del sistema, causa conflictos de memoria con otros usuarios y evita que el clúster balancee la carga correctamente.

## Optimización y Rendimiento

**28-. ¿Qué son los "nodos de cómputo" vs "headnode"?** 

Kraken coordina; los otros ejecutan. No entrenes en Kraken.

**29-. ¿Cómo sé cuánta memoria RAM requiere mi trabajo?** 

Prueba y revisa con el comando `seff <job_id>` al terminar.

**30-. ¿Por qué mis resultados son inconsistentes?** 

Asegúrate de configurar semillas (seeds) aleatorias si tu código es estocástico.

**31-. ¿Es mejor enviar muchos trabajos pequeños o uno grande?** 

Usa arreglos de tareas (*job arrays*) si tienes muchos archivos pequeños.

**32-. ¿Qué significa "Hyperthreading"?** 

Considera que un núcleo físico ejecuta dos hilos al solicitar `--cpus-per-task`.

## Resolución de Problemas Avanzada

**33-. ¿Cómo depuro un error de segmentación (segfault)?** 

Ejecuta interactivamente con `srun --pty bash`.

**34-. ¿Qué hago si olvido cancelar un trabajo en bucle?** 

Usa `scancel -u <tu_usuario>`.

**35-. ¿Por qué Antuco me da errores de librerías CUDA?** 

Es un nodo AMD; usa contenedores compatibles con **ROCm**.

**36-. ¿Qué es el "OOM Killer"?** 

El sistema mata tu proceso porque se quedó sin RAM. Solicita más memoria con `--mem=...`.

**37-. ¿Cómo reporto un problema de infraestructura?** 

Envía un correo detallando: nodo, job ID, comando y error exacto a [soporte@cenia.cl](mailto:soporte@cenia.cl).