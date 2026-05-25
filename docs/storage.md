## Almacenamiento

Este cluster proporciona múltiples opciones de almacenamiento con diferentes características de rendimiento y propósitos de uso.

## Especificaciones de Almacenamiento

| Ruta | Variable de Entorno | Rendimiento | Uso | Cuota | ¿Respaldado? |
|------|---------------------|-------------|-----|-------| ------------ |
| `/home/<pi>/<username>/` | `$HOME` | Bajo | Código + Entornos | 50GB | Si |
| `/scratch/<pi>/<username>/` | `$SCRATCH` | Bajo | Resultados temporales | 500GB | Si|
| `/archive/<pi>/<username>/` | `$ARCHIVE` | Bajo | Almacenamiento a largo plazo | 200GB | Si |
| `/workspace/<pi>/<username>/` | `$WORKSPACE` | Alto | Disco de alta velocidad para datos y resultados de jobs | 200GB | No |

## Referencia Rápida

### Directorio Home
- **Propósito**: Almacenar código, archivos de configuración y entornos de software
- **Ideal para**: Código fuente, archivos de configuración, entornos conda, scripts pequeños
- **Evitar**: Archivos de datos grandes, salidas de jobs, archivos temporales

### Directorio Scratch
- **Propósito**: Almacenamiento temporal para resultados intermedios
- **Ideal para**: Salidas de jobs que necesitan almacenamiento a corto plazo
- **Nota**: Limpiar regularmente

### Directorio Archive
- **Propósito**: Almacenamiento a largo plazo para resultados importantes
- **Ideal para**: Resultados finales, datos de publicaciones, backups importantes

### Directorio Workspace
- **Propósito**: Almacenamiento de alto rendimiento para jobs activos
- **Ideal para**: Datos de entrada/salida de jobs que requieren I/O rápido
- **Nota**: Es Responsabilidad de cada usuario eliminar los datos y liberar el espacio utilizado

## **Home**

Tiene como ruta absoluta `/home/<PI>/<username>/` y también es accesible por `~/`. Es el directorio en el que te situas por defecto al conectarte al clúster.

Es compartido entre todos los nodos del clúster. Es decir, todos los nodos (kraken y nodos de cómputo) verán los mismos archivos en la ruta de su home.

Está destinado al almacenamiento de archivos pequeños como scripts y workspaces de VS Code, por ejemplo.

El home de cada usuario tiene una cuota de 50GB. Si la sobrepasas no podrás escribir más datos a tu home y posiblemente tengas dificultades para conectarte al clúster por SSH. Puedes ver qué archivos usan almacenamiento en tu home con el comando

`ncdu ~`

Para salir de este modo puedes utilizar la letra Q

## Workspaces

Los workspaces son discos de almacenamiento locales a los nodos de cómputo y son el único almacenamiento que se tiene permitido usar para la carga de datos (datasets, pesos) en tareas de entrenamiento.

Puedes acceder a ellos remotamente desde kraken en el directorio `/workspaces`

Los workspaces de cada nodo se pueden identificar como `/workspaces/<nodo>-workspaceN`

Por ejemplo, si la ruta de un workspace en kraken es `/workspaces/ahsoka-workspace1`

Su ruta local en el nodo ahsoka sería `/workspace1`

**Importante:** Una vez que termines de usar un workspace, ya sea porque terminaste de entrenar un modelo, un experimento, magíster o doctorado es TU responsabilidad eliminar los datos y liberar el espacio utilizado.

## Scratch y Archive

Dentro de tu directorio home encontrarás dos carpetas especiales llamadas scratch y archive. Cada una tiene un propósito distinto y cuotas de almacenamiento diferentes:

`scratch` → Espacio de trabajo temporal, con una cuota ampliada de `500 GB`.
Úsalo para almacenar resultados intermedios, archivos generados durante ejecuciones de pruebas o simulaciones.

`archive` → Espacio para almacenamiento permanente, con una cuota de `200 GB`.
Está pensado para resultados finales, respaldos y datos importantes que necesites conservar a largo plazo.

## Buenas prácticas de uso

No almacenes datos críticos en scratch.

Organiza tu información en subcarpetas claramente nombradas (por ejemplo, por proyecto o fecha).

Evita saturar archive con resultados repetidos o archivos fácilmente regenerables; úsalo sólo para lo esencial.

Libera espacio cuando termines una simulación o análisis moviendo únicamente lo necesario a archive o descargándolo a tu propio equipo.

Mantener un uso ordenado de estos directorios es clave para la convivencia y el rendimiento general del clúster. Recuerda que el almacenamiento compartido es un recurso común: ¡tu organización beneficia a todo el equipo!



## **Comandos útiles**

- `df -h`: Muestra el espacio disponible en los sistemas de archivos `-h` indica que sea legible para humanos (MB GB).
- `du <ruta>`: Consultar peso de un directorio o archivo si se aplica el `-s` mostrará el summary de este.
- `scp`: permite realizar copias a traves de ssh a otra maquina.
- `mv`: permite mover archivos dentro de los directorios deseados.
- `cp`: permite copiar archivos dentro de los directorios deseados.
- `rm`: permite eliminar algun archivo.
- `rm -r`: permite eliminar un directorio y su contenido.
