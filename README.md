10 heurísticas de usabilidad de Nielsen

1. Visibilidad del estado del sistema
  – Mostrar indicadores de carga (loading spinners).
  – Notificaciones al guardar, enviar o borrar datos.
  – Cambios de estado visibles (como botones que se desactivan tras un clic).

 2. Coincidencia entre el sistema y el mundo real
  – Usar palabras como “reservar”, “cancelar”, “cliente”, en lugar de términos técnicos como “commit” o “record”.
  – Mostrar fechas en formato local (dd/mm/aaaa).
  – RUTs formateados automáticamente.

 3. Control y libertad del usuario
  – Botón “Cancelar” en formularios.
  – Posibilidad de editar o eliminar reservas.
  – Confirmaciones antes de acciones destructivas.

4. Consistencia y estándares
  – Todos los formularios tienen la misma estructura (label arriba, input abajo).
  – Mismos colores y tipografía en toda la app.
  – Iconografía coherente (por ejemplo, ícono de lápiz siempre significa “editar”).

5. Prevención de errores
   – Validación de campos antes de enviar un formulario.
  – Formateo automático del RUT para evitar errores de entrada.
  – Deshabilitar botones cuando no hay datos válidos.

6. Reconocimiento mejor que recuerdo
  – Menús visibles en vez de tener que recordar comandos.
  – Formularios autocompletados con datos previos.
  – Horarios de reserva mostrados como bloques visuales, no campos de texto.

7. Flexibilidad y eficiencia de uso
  – Inputs con autocomplete para clientes frecuentes.
  – Shortcuts o teclas rápidas para acciones comunes.
  – Formularios dinámicos que se adaptan según lo que ya se conoce del cliente.

8. Diseño estético y minimalista
  – Evitar formularios sobrecargados.
  – Uso de tipografía clara y espaciado adecuado.
  – No mostrar información técnica irrelevante al usuario.

 9. Ayudar a reconocer, diagnosticar y recuperarse de errores
  – “El RUT ingresado ya está registrado. ¿Desea usar los datos existentes?”
  – Colores como rojo para errores y verde para éxito.
  – Alertas visibles con guía para corregir.

10. Ayuda y documentación
  – Tooltips sobre íconos o campos complejos.
  – Botón de “Ayuda” que abre una explicación.
  – FAQ o manual de uso en línea.


SonarQube:
```bat
cmd /k "cd /d C:\Tools\SonarQube\bin\windows-x86-64 && StartSonar.bat"

```
BACKEND:
```bat
cmd /c "mvn clean verify sonar:sonar -DskipTests=true -Dsonar.projectKey=backend -Dsonar.projectName=backend -Dsonar.host.url=http://localhost:9000 -Dsonar.token=sqa_77ce388a2339ace6e8ee104e189adee1ad4ee4e5"
```
FRONT: 
```bat
npx eslint . --ext .js,.jsx
```
```bat
sonar-scanner
```

Página:
[http://localhost:9000](http://localhost:9000)
