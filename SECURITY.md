# Seguridad y protección de datos

Este proyecto aplica controles inspirados en ISO/IEC 27001 y OWASP. Este documento
no representa una certificación ISO: la certificación también exige procesos,
responsables, evaluación de riesgos, evidencias, auditorías y mejora continua.

## Controles implementados

- Todos los endpoints son privados por defecto. Solamente el inicio de sesión está
  marcado como público.
- La autorización exige el rol `admin` por defecto. La versión de sesión almacenada
  en la base permite invalidar sesiones al cerrar sesión.
- El JWT se entrega únicamente mediante cookie `HttpOnly`; no se guarda en
  `localStorage` ni se devuelve en el cuerpo de la respuesta.
- En producción la cookie usa `Secure`, `SameSite=None`, `Partitioned` y prefijo
  `__Host-`, porque frontend y API están alojados en orígenes distintos.
- CORS usa una lista explícita de orígenes y toda mutación exige el encabezado
  `X-CSRF-Protection: 1`.
- Contraseñas almacenadas con bcrypt. El costo configurable recomendado es 12 y
  los hashes antiguos se actualizan después de un inicio de sesión válido.
- Límite global de 120 peticiones por minuto y límite de 5 intentos de inicio de
  sesión por minuto.
- DTO estrictos, campos desconocidos rechazados, límites de longitud, valores
  enumerados y sanitización de texto.
- Peticiones mutables limitadas a JSON; cuerpos JSON limitados a 100 KB. No existen
  endpoints de subida de archivos.
- Consultas de aplicación parametrizadas mediante TypeORM. Los scripts que
  interpolan nombres usan exclusivamente listas internas fijas.
- Helmet, `no-store`, HSTS y rechazo de HTTP en producción.
- La contraseña nunca se selecciona ni se devuelve en consultas normales. Las
  respuestas de horarios omiten teléfono, correo y dirección del docente.
- Restricciones SQL protegen estados, tipos, bloques y cantidades. Se revocaron los
  permisos por defecto de `PUBLIC` sobre tablas, secuencias y creación de objetos.
- Teléfono, correo y dirección de docentes admiten cifrado AES-256-GCM autenticado.
- `DB_SYNC=false` evita alteraciones automáticas del esquema; los cambios se aplican
  mediante migraciones versionadas.

## Variables obligatorias en Render

No copies valores reales a este archivo ni a Git.

```text
NODE_ENV=production
DB_SYNC=false
DB_SSL=require
CORS_ORIGINS=https://sanmartin-frontend.onrender.com
JWT_SECRET=<aleatorio de al menos 32 caracteres>
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=12
DATA_ENCRYPTION_KEY=<32 bytes en Base64>
```

Generación local segura:

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -base64 32   # DATA_ENCRYPTION_KEY
```

La clave de cifrado debe conservarse en el gestor de secretos de Render y en un
respaldo seguro. Perderla hace imposible recuperar los datos cifrados. Cambiarla
sin una migración de rotación también vuelve ilegibles esos datos.

## Despliegue seguro del cifrado

1. Crear `DATA_ENCRYPTION_KEY` una sola vez y configurarla en Render y en el entorno
   autorizado desde el que se ejecutará la migración.
2. Configurar un nuevo `JWT_SECRET` en Render. Esto cerrará las sesiones anteriores.
3. Confirmar `DB_SYNC=false` y desplegar primero el backend y después el frontend.
4. Verificar el inicio de sesión y la lectura de docentes.
5. Simular el cifrado con `npm run security:encrypt`.
6. Ejecutar `npm run security:encrypt -- --apply`. El script genera antes un respaldo
   local ignorado por Git y con permisos `0600`.
7. Volver a ejecutar la simulación; debe indicar cero registros pendientes.

No se debe ejecutar el paso 6 mientras el backend desplegado no tenga exactamente
la misma `DATA_ENCRYPTION_KEY`.

## RLS y acceso por registro

Actualmente el sistema tiene un único administrador y todos los registros pertenecen
a una sola institución. El acceso por registro se aplica en la API mediante
autenticación y rol administrativo. No se activó una política PostgreSQL RLS ficticia
con `USING (true)`, porque no restringiría nada, ni una política por propietario que
ocultaría información escolar compartida.

Antes de incorporar varias instituciones o roles limitados se debe agregar a las
tablas una clave de alcance, por ejemplo `school_id`, propagarla desde la sesión y
crear políticas RLS `USING`/`WITH CHECK` dentro de transacciones. Esa migración debe
tener pruebas de aislamiento entre instituciones.

## Secretos en el historial Git

El código actual no contiene credenciales reales y `.env` está ignorado. Un antiguo
valor JWT de desarrollo existió en el historial, por lo que debe considerarse
comprometido y no volver a usarse. La rotación invalida ese valor.

Eliminarlo físicamente del historial exige reescribir commits y hacer `force-push`,
lo que cambia los SHA y obliga a todos los colaboradores a volver a clonar. Debe
hacerse en una ventana coordinada, con los repositorios limpios y después de rotar
primero el secreto desplegado.

## Dependencias

Ejecutar periódicamente:

```bash
npm run security:audit
```

No usar `npm audit fix --force` sin una rama específica y pruebas funcionales. Las
actualizaciones mayores de Nest y Angular se tratan como migraciones independientes.

## Copias de seguridad

`npm run security:schema -- --apply` crea un respaldo completo antes de cambiar el
esquema, valida los datos, aplica la migración y comprueba que la cantidad de filas
no haya cambiado. Los archivos se guardan en `backups/`, quedan fuera de Git y deben
tratarse como información confidencial.
