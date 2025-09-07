# Uso de SSH

Nota: Para las siguientes instrucciones, reemplaza cualquier instancia de `<usuario>` con el nombre de usuario que solicistaste para la creación de tu cuenta en el clúster.

## 1. Obligatorio - Cambio de contraseña

Una vez que tengas un usuario en el clúster, el primer paso es cambiar tu contraseña por defecto para evitar el acceso de terceros no autorizados a tu cuenta. Para ello debes conectarte al clúster y ejecutar el comando `passwd` :

```
[pc-personal]$ ssh <usuario>@kraken.ing.puc.cl
[kraken]$ passwd
[kraken]Current password:
[kraken]New password:
[kraken]Retype new password:
[kraken]passwd: Password updated successfully
[kraken]$ exit
[pc-personal]$ 
```

## 2. Recomendado - Llave SSH

Este paso es opcional pero altamente recomendado por motivos de seguridad y comodidad para el usuario.

Si ya tienes una llave SSH puedes saltarte al paso 2.2. De lo contrario, sigue leyendo:

### 2.1 Creando una llave SSH

El procedimiento para generar una llave SSH es el mismo si estás en Linux, Mac o si usas WSL en Windows:

```
[pc-personal]$ ssh-keygen
[pc-personal]$ Enter passphrase (empty for no passphrase):
[pc-personal]$ Enter same passphrase again:
```

Puedes ingresar un passphrase durante la creación de la llave para que se te solicite al momento de conectarte por SSH, o dejarlo en blanco para poder conectarte sin ingresar una contraseña.

Esto creará un par público/privado de llaves en el directorio `.ssh` en tu carpeta de usuario. El output de `ssh-keygen` te dirá el nombre de los archivos de las llaves.

### 2.2 Copiando la llave SSH al clúster

Una vez tengas tus llaves SSH debes copiar tu llave pública al clúster. Este es el archivo terminado en .pub creado en el paso anterior. Suponiendo que la llave está en `.ssh/id_ed25519.pub` solo debes correr:

```
[pc-personal]$ ssh-copy-id -i .ssh/id_ed25519.pub <usuario>@kraken.ing.puc.cl
```

Se te pedirá la contraseña que configuraste en el paso 1. Una vez terminado el procedimiento deberías poder conectarte al clúster sin contraseña (o usando el passhprase, si configuraste uno en el paso 2.1) con:

```
[pc-personal]$ ssh <usuario>@kraken.ing.puc.cl
[kraken]$
```

## 3. Opcional - Configuración de SSH

Es posible configurar muchos aspectos de SSH para facilitar su uso creando y editando el archivo
`.ssh/config`

Por ejemplo, puedes definir un “alias” para conectarte a un servidor con un usuario específico sin necesidad de usar la sintaxis completa `<usuario>@servidor`

Vamos a usar el clúster como ejemplo. Si no existe, crea el archivo `.ssh/config`
Agrega las siguientes líneas, reemplazando `<usuario local>` por tu usuario y `<llave pública>` con el archivo .pub que contiene tu llave pública:

```
IdentityFile /home/<usuario local>/.ssh/<llave pública>

Host kraken
    HostName kraken.ing.puc.cl
    User <usuario>
```

Ahora deberías poder conectarte al clúster simplemente corriendo:

```
[pc-personal]$ ssh kraken
```

Esto le dice al cliente de SSH que intente usar tu llave pública para todas las conexiones y que `kraken` es una abreviación de `<usuario>@kraken.ing.puc.cl`

Adicionalmente, si quieres conectarte directamente a algún nodo del clúster (por ejemplo, para copiar datos con `scp` o `rsync`) puedes hacerlo usando a kraken como proxy con las siguientes líneas de configuración:

```
Host ahsoka
        HostName ahsoka
        User <usuario>
        ProxyJump <usuario>@kraken
```

Ahora deberías poder conectarte al nodo (en este caso ahsoka) simplemente corriendo:

```bash
[pc-personal]$ ssh ahsoka
```