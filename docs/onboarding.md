# Primeros Pasos / Registro

## Solicitar acceso al clúster IALab

Para obtener acceso al clúster IALab debes completar el siguiente formulario de registro:

[Formulario de Registro](https://bit.ly/registroClusterIALab){ .md-button }

Una vez procesada tu solicitud, recibirás tus credenciales de acceso (usuario y contraseña).

## Primera conexión al clúster

El nodo de entrada del clúster es **Kraken**. Para conectarte, abre una terminal y ejecuta:

```bash
ssh <usuario>@kraken.ing.puc.cl
```

Reemplaza `<usuario>` con el nombre de usuario que recibiste.

### Cambio de contraseña obligatorio

Al conectarte por primera vez debes cambiar tu contraseña por defecto:

```bash
[pc-personal]$ ssh <usuario>@kraken.ing.puc.cl
[kraken]$ passwd
[kraken]Current password:
[kraken]New password:
[kraken]Retype new password:
[kraken]passwd: Password updated successfully
```

### ¿Ya tienes acceso?

Para configurar llaves SSH, alias de conexión u otras opciones avanzadas, consulta la guía completa en [Uso de SSH](instructions-and-guides/ssh.md).

### ¿Cómo envío mis trabajos?

Este clúster funciona utilizando SLURM como sistema de cola de tareas, para ver más detalles de como correr tus trabajos, puedes ir la guía completa en [Uso de SLURM](instructions-and-guides/slurm.md).