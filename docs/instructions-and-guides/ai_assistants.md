# Asistentes de IA en el clúster (Claude Code, Codex…)

Puedes usar asistentes de programación con IA, como Claude Code u OpenAI Codex, para trabajar en el clúster. Esta página explica cómo hacerlo **sin afectar a los demás usuarios**: dónde correr el asistente, qué evitar y qué cuidados tener con tus datos. Las reglas valen para cualquier asistente y cualquier lenguaje; los ejemplos usan Claude Code y Python.

## Cómo usarlo

El asistente se usa **dentro de un trabajo de SLURM**, no directamente en Kraken. Kraken es el nodo de entrada: sirve para editar, enviar trabajos y revisar su estado, no para ejecutar procesos (ver [Política de Uso](../usage_policy.md)).

**1. Abre una sesión.** Desde Kraken, abre una sesión interactiva acotada:

```bash
srun --account=default-account --partition=ialab-low --qos=regular --time=02:00:00 \
     --cpus-per-task=2 --mem=8G --comment="Sesión con asistente para <tu proyecto>" --pty bash
```

Cuando la sesión se abra (el prompt cambia al nombre del nodo), inicia el asistente:

```bash
claude
```

Si usas VS Code, conéctalo a un nodo de cómputo como se explica en la [FAQ](../faq.md) y abre el asistente directamente en esa terminal. Si ya estás en un nodo, no abras otro `srun`: los comandos se ejecutan directamente ahí.

En `ialab-low`, los 4 CPU y 20 GB por GPU que menciona [Políticas de SLURM](slurm_policies.md) son **valores por defecto**: una sesión sin GPU funciona si pides `--cpus-per-task` y `--mem` explícitamente (máximo 80 GB por nodo).

**2. No pidas GPU para la sesión** si solo vas a escribir código, revisar logs o preparar scripts. Si necesitas probar algo con GPU, cierra la sesión (`exit`) y abre una nueva con `--gres=gpu:1`; no mantengas dos sesiones a la vez.

**3. Envía los procesos largos con `sbatch`** (ver [SLURM](slurm.md)); no los corras dentro de la sesión interactiva.

**4. Al terminar, cierra la sesión** con `exit` para liberar los recursos.

Todo trabajo, ya sea `srun` o `sbatch`, debe llevar `--comment` con una breve descripción de su propósito; si no, SLURM lo rechaza. Revisa las [Políticas de SLURM](slurm_policies.md) para elegir partición, QoS y tiempo.

## Qué hacer y qué evitar

Las filas marcadas con **(política)** son reglas del clúster y su incumplimiento tiene consecuencias. El resto son buenas prácticas.

| Evita | Por qué | En su lugar |
|-------|---------|-------------|
| Abrir el asistente en Kraken o dejar que ejecute procesos ahí **(política)** | Kraken es compartido por todos; los procesos pesados fuera de SLURM se eliminan sin aviso y se penalizan | Abre una sesión con `srun` y lanza el asistente dentro |
| Pedir GPU para la sesión "por si acaso" o dejar la sesión abierta sin uso | Reserva recursos que otros usuarios están esperando | Sesión sin `--gres`, con `--time` acotado, y `exit` al terminar |
| Correr un entrenamiento largo dentro de la sesión interactiva | Se corta al cerrar la sesión y bloquea recursos mientras conversas con el asistente | Envíalo con `sbatch` |
| Enviar trabajos sin `--comment` **(política)** | SLURM rechaza el trabajo | `--comment="<qué hace el experimento>"`, breve y sin datos sensibles |
| Dejar que el asistente lea, o pegarle, datos personales, sensibles o de convenios (pacientes, RUT, encuestas…) | Todo lo que el asistente lee se envía a un proveedor externo, fuera del clúster. Los asistentes abren archivos por su cuenta, sin que se los muestres | No le pidas que abra esos archivos y rechaza el permiso si intenta leerlos. Trabaja con el código, el esquema o muestras pequeñas y sintéticas; ante la duda, consulta a tu supervisor |
| Pegar contraseñas, tokens o claves en la conversación, en nombres de trabajos o en `--comment` | Salen del clúster, o los ven otros usuarios con `squeue`, `sacct` y `ps` | Variables de entorno o archivos con permisos `600` |
| Usar el asistente para buscar vulnerabilidades, escalar privilegios o sondear el sistema | Pone en riesgo el clúster y los datos de todos | No lo hagas. Si encuentras un problema de seguridad, avisa a soporte |
| Dejar que el asistente borre o mueva archivos sin revisar antes | Workspace no tiene respaldo, y recuperar el resto depende de soporte | Revisa qué va a borrar antes de aceptar |
| Compartir carpetas con `chmod 777` | Expone tus datos a todo el clúster | Usa [ACL](acl.md) |
| Enviar el script que genera el asistente sin revisarlo | Puede equivocarse de cuenta, partición, QoS o tiempo | Revisa esos valores; el [monitoreo de trabajos](job_monitoring.md) te ayuda a ajustar recursos |
| Guardar datasets, checkpoints o cachés en tu home **(política)** | El home tiene 50 GB; si se llena, puedes perder el acceso | Sigue las reglas de [Almacenamiento](../storage.md) |

## Qué pasa si no se cumple

No hay reglas especiales para el uso de asistentes: lo que haga el asistente con tu cuenta es tu responsabilidad, y aplica la [Política de Uso](../usage_policy.md) del clúster. En particular, correr procesos fuera de SLURM y no respetar las reglas de almacenamiento tienen penalizaciones.

## La skill cluster-ialab

Para Claude Code existe una *skill* (un conjunto de instrucciones) llamada `cluster-ialab`, que le enseña cómo funciona este clúster: particiones, QoS, almacenamiento, comandos propios y estas mismas reglas. Con ella, Claude escribe scripts que ya cumplen las políticas (por ejemplo, incluye `--comment` y la QoS correcta) y te avisa antes de que rompas una regla.

La skill estará disponible preinstalada en el clúster. Para comprobar si ya está activa, escribe `/skills` dentro de Claude Code y busca `cluster-ialab`. La skill te ayuda a cumplir las reglas, pero no reemplaza leer esta documentación.

## Instalar Claude Code

**1. Instala Claude Code** en tu home, dentro de una sesión `srun` (ver [Cómo usarlo](#como-usarlo)):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Queda en `~/.local/bin/claude`. Como tu home es el mismo en todos los nodos, basta con instalarlo una vez.

**2. Inicia sesión.** Ejecuta `claude` y, cuando te pida iniciar sesión, abre el enlace que muestra en el navegador de tu computador y pega el código de vuelta en la terminal. Cada usuario usa su propia cuenta.

**3. Ten en cuenta la cuota.** Claude Code guarda su configuración y su historial en `~/.claude`, que cuenta para tu cuota de 50 GB.

## Enlaces

- [Política de Uso](../usage_policy.md)
- [Políticas de SLURM](slurm_policies.md)
- [SLURM](slurm.md)
- [Almacenamiento](../storage.md)
- [Compartir datos usando ACL](acl.md)
- [Monitoreo y eficiencia de trabajos](job_monitoring.md)
- [FAQ](../faq.md)
- Soporte: [soporte@cenia.cl](mailto:soporte@cenia.cl)
