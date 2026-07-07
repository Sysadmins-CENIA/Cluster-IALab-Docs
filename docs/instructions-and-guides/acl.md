# Compartir datos usando ACL en Linux

Las ACL (Access Control Lists) permiten definir permisos detallados para usuarios y grupos específicos de forma individual, superando la limitación de los permisos tradicionales de Linux (usuario, grupo, otros).

Esta guía muestra cómo gestionar estos permisos utilizando ejemplos prácticos adaptados a nuestras rutas de almacenamiento.

!!! note
    En los siguientes ejemplos se asume el uso de la variable de entorno **`$WORKSPACE`** y **`$ARCHIVE`**, la primera apunta a tu espacio de alto rendimiento en el disco local de cada uno de los nodos (`/workspace1/$PI/$USER`) y la segunda a uno de almacenamiento de largo plazo (`/home/$PI/$USER/archive`). Para más detalles sobre el funcionamiento y las características de esto espacios, consulta la sección de [Almacenamiento](../storage.md).

---

## Herramientas clave

Para administrar las ACL utilizaremos dos comandos principales:

* **`getfacl`**: muestra la lista de control de acceso de un archivo o directorio.
* **`setfacl`**: define, modifica o elimina las reglas de acceso.

---

## Consultar permisos con getfacl

El comando `getfacl` (get file access control list) permite leer y mostrar las listas de control de acceso de cualquier archivo o directorio. Su objetivo es diagnosticar de forma clara qué usuarios o grupos adicionales tienen permisos específicos y cuáles son sus permisos efectivos actuales.

La sintaxis básica del comando es:

```bash
getfacl <directorio_o_archivo>
```

Al ejecutar este comando sobre un elemento (por ejemplo, `$WORKSPACE/mi_proyecto`), se obtiene una salida estructurada similar a la siguiente:

```text
# file: workspace1/$PI/$USER/mi_proyecto
# owner: $USER
# group: grupo_investigacion
user::rwx
group::r-x
other::---
```

Cada línea de la salida proporciona información clave sobre la seguridad del objeto:

* **`# file`**: indica la ruta del archivo o directorio consultado.
* **`# owner` y `# group`**: identifican al usuario propietario y al grupo principal del archivo.
* **`user::`**: muestra los permisos tradicionales del propietario (en este caso, `rwx`).
* **`group::`**: muestra los permisos tradicionales del grupo propietario (en este caso, `r-x`).
* **`other::`**: muestra los permisos tradicionales para cualquier otro usuario del sistema (en este caso, sin acceso: `---`).

Si el archivo o directorio tiene reglas de ACL extendidas, estas aparecerán en líneas adicionales especificando el nombre del usuario o grupo correspondiente. Por ejemplo: `user:usuario_colaborador:rwx`.

---

## Modificar permisos con setfacl

El comando `setfacl` permite definir o modificar los permisos de acceso de un archivo o directorio. La estructura general del comando es la siguiente:

```bash
setfacl [opciones] <directorio_o_archivo>
```

Para modificar o añadir permisos, se utiliza el flag `-m` (modify) seguido de la especificación de permisos para usuarios (`u:`) o grupos (`g:`):

```bash
setfacl -m <tipo_entrada>:<nombre>:<permisos> <directorio_o_archivo>
```

### Dar acceso de lectura y escritura a un colaborador en tu $WORKSPACE
Si deseas permitir que un colaborador (`usuario_colaborador`) trabaje en tu espacio de alto rendimiento:

```bash
# Otorga lectura (r), escritura (w) y ejecución (x)
setfacl -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto
```

!!! note
    Es importante recordar que el permiso de ejecución (`x`) en un directorio es un requisito indispensable en Linux para que cualquier usuario pueda acceder a su interior (usando el comando `cd`) y listar o interactuar con los elementos que contiene.

### Compartir un directorio con permisos de solo lectura
Si solo quieres que un colaborador pueda visualizar y copiar tus resultados en tu almacenamiento `/home`. Por ejemplo en tu archivo en el directorio `$ARCHIVE/mis_resultados`:

```bash
# Otorga lectura (r) y ejecución (x)
setfacl -m u:usuario_colaborador:rx $ARCHIVE/mis_resultados
```

### Dar acceso a un grupo completo de usuarios
Para que todos los miembros del grupo de investigación `grupo_bioinfo` puedan leer tu directorio:

```bash
setfacl -m g:grupo_bioinfo:rx $WORKSPACE/mi_proyecto
```

---

## Heredar permisos automáticamente (default ACLs)

Por defecto, los archivos y subcarpetas que se creen dentro de un directorio no heredan las reglas de ACL. Para configurar la herencia automática de permisos para elementos futuros, se utiliza el flag `-d` (default).

### Combinación recomendada (recursivo y por defecto)
Si quieres que tu colaborador tenga acceso tanto a lo que **ya existe** en el directorio, como a todo lo que se **cree en el futuro**:

```bash
# 1. Aplicar recursivamente (-R) a lo que ya existe
setfacl -R -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto

# 2. Configurar la herencia por defecto (-d) para el futuro
setfacl -d -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto
```

---

## La máscara de ACL (mask) y permisos efectivos

Uno de los conceptos más importantes y que suele causar confusión es la **máscara (`mask::`)**.

En ACL la máscara actúa como un **"techo" o límite máximo** de permisos aplicable para todos los usuarios y grupos específicos añadidos (no afecta al propietario del archivo ni a la sección de "otros").

Los permisos reales que tendrá un usuario o grupo (llamados **permisos efectivos**) se calculan realizando una operación lógica `AND` entre los permisos otorgados por la regla de ACL y la máscara actual. Si una regla de ACL otorga permisos que superan a la máscara, el usuario solo obtendrá la intersección de ambos.

Por ejemplo, si un usuario tiene permisos de lectura y escritura (`rw-`), pero la máscara se establece en solo lectura (`r--`), el permiso efectivo real de ese usuario será únicamente de lectura (`r--`).

!!! note
    Ciertos comandos estándar de Linux, como `chmod`, recalculan automáticamente la máscara de las ACL extendidas para que coincida con los permisos de grupo tradicionales del archivo. Esto significa que si ejecutas un comando como `chmod g-w archivo.txt`, el sistema podría reducir la máscara de ACL, limitando inesperadamente los accesos de escritura que habías configurado previamente para tus colaboradores.

### Ejemplo de restricción por máscara

A continuación, se muestra de manera práctica cómo se aplica esta restricción en el sistema.

Si primero otorgas acceso de lectura, escritura y ejecución a tu colaborador en un directorio:
```bash
setfacl -m u:usuario_colaborador:rwx $WORKSPACE/mi_proyecto
```

Y luego reduces la máscara del mismo directorio para limitar los permisos a solo lectura (`r--`):
```bash
setfacl -m m::r-- $WORKSPACE/mi_proyecto
```

Al inspeccionar el directorio con `getfacl $WORKSPACE/mi_proyecto`, verás lo siguiente:

```text
# file: workspace1/$PI/$USER/mi_proyecto
owner: $USER
group: grupo_investigacion
user::rwx
user:usuario_colaborador:rwx  #effective:r--
mask::r--
other::---
```

!!! warning
    Como la máscara se redujo a `r--`, el permiso real o efectivo de `usuario_colaborador` queda restringido a solo lectura (`#effective:r--`), a pesar de que su regla individual de usuario sigue diciendo `rwx`.
    Si un colaborador tiene problemas para escribir en una carpeta donde supuestamente tiene permisos asignados, **revisa siempre el valor de la máscara**.

Para restaurar los accesos y permitir de nuevo la escritura, debes restablecer la máscara a un nivel superior:
```bash
setfacl -m m::rwx $WORKSPACE/mi_proyecto
```

---

## Caso práctico: compartir el script gpt.py con diferentes permisos

Imagina que el usuario **Aldo** es el propietario del script `gpt.py` dentro de su `$WORKSPACE`. Aldo desea colaborar con tres compañeros asignándoles permisos específicos sobre este archivo:

1. **David**: solo debe poder **leer** el archivo (`r--`).
2. **José**: debe poder **leer y escribir** (modificar) el archivo (`rw-`).
3. **Diego**: debe saber que el archivo existe en la carpeta (ver el nombre), pero **no debe poder ni leer ni modificar** su contenido (`---`).

A continuación, se muestran dos formas de realizar esta configuración.

### Opción A: mediante comandos individuales (paso a paso)
Esta forma es ideal si vas agregando colaboradores de manera progresiva.

```bash
# 1. Dar acceso de solo lectura a David
setfacl -m u:david:r-- $WORKSPACE/gpt.py

# 2. Dar acceso de lectura y escritura a José
setfacl -m u:jose:rw- $WORKSPACE/gpt.py

# 3. Denegar explícitamente lectura y escritura a Diego
setfacl -m u:diego:--- $WORKSPACE/gpt.py
```

### Opción B: en una sola línea (comando combinado)
Si quieres aplicar todas las reglas al mismo tiempo, puedes separar las instrucciones con comas:

```bash
setfacl -m u:david:r--,u:jose:rw-,u:diego:--- $WORKSPACE/gpt.py
```

### Comprobación del resultado (getfacl)
Una vez ejecutados los comandos, Aldo ejecuta `getfacl $WORKSPACE/gpt.py` para verificar los accesos. La salida esperada es:

```text
# file: /workspace1/$PI/aldo/gpt.py
# owner: aldo
# group: grupo_investigacion
user::rw-
user:david:r--
user:jose:rw-
user:diego:---
mask::rw-
other::---
```

!!! note
    Diego podrá ver el nombre del archivo `gpt.py` al hacer `ls` en la carpeta (siempre y cuando tenga permisos de lectura y ejecución en el directorio contenedor), pero si intenta leer el script (`cat gpt.py`) o editarlo, el sistema le devolverá el mensaje: `Permission denied` (permiso denegado).

---

## Eliminar permisos de ACL

El comando `setfacl` también permite revocar los accesos especiales previamente otorgados.

Para eliminar los permisos de acceso de un usuario específico en un archivo o directorio, se puede utilizar el flag `-x` (remove) seguido del identificador del usuario:

```bash
setfacl -x u:usuario_colaborador $WORKSPACE/mi_proyecto
```

Si necesitas eliminar la herencia de permisos (ACL por defecto) asociada a un usuario específico en un directorio sin afectar sus permisos sobre los archivos existentes, se combina el flag `-d` con `-x`:

```bash
setfacl -d -x u:usuario_colaborador $WORKSPACE/mi_proyecto
```

En caso de que desees finalizar la colaboración en su totalidad y restaurar el comportamiento de seguridad nativo de Linux, puedes remover todas las ACLs extendidas (tanto de usuarios como de grupos) y limpiar el archivo usando el flag `-b` (remove all):

```bash
setfacl -b $WORKSPACE/mi_proyecto
```

---

## Preservar ACLs al copiar o sincronizar

Por defecto, los comandos de transferencia estándar de Linux (como `cp` o `rsync` sin argumentos adicionales) no copian los atributos extendidos del sistema de archivos. Esto significa que si copias un archivo o directorio con ACLs configuradas a otra ubicación, el nuevo archivo perderá todos los accesos especiales que habías definido, volviendo al esquema básico de permisos del usuario que realiza la copia.

Para mantener la colaboración activa y evitar la pérdida de estos permisos durante traslados o copias de respaldo, es fundamental indicar explícitamente a las herramientas que preserven estos metadatos utilizando los flags correctos.

**Con `cp`**: Utiliza el flag `-p` para conservar los atributos y ACLs:

```bash
cp -p archivo.txt $ARCHIVE
```

**Con `rsync`**: Utiliza el flag `-A` (o `--acls`) para transferir las ACLs:

```bash
rsync -avA $WORKSPACE/mi_proyecto $ARCHIVE
```
