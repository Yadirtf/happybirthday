en este archiv se describe la informacion importante para realizarse:

este repositorio se creo con el fin de crear una pagina no publicitaria, ni de marketing, ni de empresa, solo enfocada a mostrar una dedicatoria muy especial, el cual es el cumpleaños de mi prima.

quiero que investigiues este link https://motionsites.org/es/skills/motion-graphics/crayon-book-film-style?copy=1 
ya que me gusta el diseño de como usa skill dedicadas para la generacion de paginas super geniales, en este caso no quiero que se genere video como producto final, sino que sea una apgina animada, y de la opcion de poder descargar el video.

contare o dare contexto para que puedas entender mi relacion con mi prima y de hay puedas generar una gran idea de que podemos hacer y darle esta pagina como su regalo, un regalo visual, entretenido, que se sienta muy querida:

con mi prima, eya se llama Dayana, somos muy cercanos, desde muy niños, claro que con la hermana de ella la cual tambien me llebo super bien, somos muy cercanos, ya que desde niños conviviamos juntos, hubo un año en el cual me fui a vivir con mi tia y mis primas, estudiamos en el mismo cole todo ese año, ahora cuando entre a la universidad tambien fui a vir con mi tia y mis primas, por custiones econimicas mi tia tubo que arrendar la casa y salimos con Tatiana y Dayana a bucar una casa para arrendar y tambien vivimo juntos varios meses, actualmente ya no vivo con ellas porque vine a vivir con mis abuelos para estar mas cerca de ellos y mi hermana.

entonces como podras ver, siempre hemos sido muy unidos, muy cercanos, nos contamos todo, son como mis hermanas, las amo mucho, y en esta ocacion Dayana esta cumpliendo 25 años, y pues me gustaria darle un detalle, el cual es este, actualmente on tengo ideas, pero si tengo ya un diseño o estilo de como se debe ver la pagina, la cual es el enlace que adjunte. 

entonces la idea es que en base a lo anterior me ayudes a proponer ideas geniales e interactivas para poder darle un  detalle virtual que no olvide.

adjunto un carpeta de assets la cual contiene dos fotos, entre ellas, ella en una moto, la cual se ve toda chistosa. 
---

## 🖍️ El libro de Dayana (lo que se construyó)

Una página animada con estilo de **libro de crayones**: todo se dibuja a mano en un canvas, con líneas que "tiemblan" cuadro a cuadro (12 fps, como la animación hecha a mano), textura de cera y papel.

**Las páginas del libro**

| # | Página | Interacción |
|---|--------|-------------|
| 0 | Portada "El libro de Dayana · 25" | toca para abrir (arranca la cajita musical) |
| 1 | Érase una vez… los tres de niños | toca a cada uno y salta |
| 2 | El año del cole | toca la campana |
| 3 | Casa nueva (universidad, buscando arriendo) | toca el letrero "SE ARRIENDA" |
| 4 | Hoy: la casa de los abuelos y la de Dayana y Tati | toca y viajan corazones |
| 5 | La motera (su foto en la moto) | toca la moto: ¡brrrum! |
| 6 | Nosotros (las otras dos fotos) | toca las fotos |
| 7 | Pastel con velitas 2 y 5 | sopla tocando las velitas, o con el micrófono 🎤 |
| 8 | Carta final escrita a mano | ver otra vez / descargar la película |

**Descargar el video:** el botón "⬇ video" graba la película completa (~1,5 min, vertical 720×1280, con música) y la descarga. En Chrome/Edge sale en `.mp4`; en otros navegadores puede salir en `.webm`. Hay que dejar la pestaña abierta mientras graba.

**Cambiar textos:** todo lo que se lee está en [`js/content.js`](js/content.js).

**Fotos:** `assets/fotos/` (moto.jpeg, juntos-1.jpeg, juntos-2.jpeg).

**Verla / compartirla:** las fotos y la grabación necesitan que la página se sirva por http (no abriendo el archivo con doble clic). Lo más fácil es GitHub Pages: *Settings → Pages → Deploy from a branch → `main` / root*, y el enlace queda como `https://yadirtf.github.io/happybirthday/`. Para probar en el computador: `python3 -m http.server` dentro de la carpeta y abrir `http://localhost:8000`.
