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

## 🖍️ Receta secreta: cómo se hace una Dayana (lo que se construyó)

Una página animada con estilo de **libro de crayones**: todo se dibuja a mano en un canvas, con líneas que "tiemblan" cuadro a cuadro (12 fps, como la animación hecha a mano), textura de cera y papel.

La historia se cuenta como una **receta**: en cada página los muñequitos (Dayana, Tati, Yadir, la tía, Danielito y Aslei) hacen su escena y luego saltan a la olla con un "¡plop!".

| # | Página | Se toca… |
|---|--------|----------|
| 0 | Portada: el recetario | para abrir (arranca la cajita musical) |
| 1 | Paso 1 · Prender el horno (el origen) | el horno: ¡ding! salen los tres |
| 2 | Una tía con abrazo de mamá | la tía: "¡Vicentico!" |
| 3 | Una hermana con chantaje incluido | a Tati |
| 4 | Un año de cole compartido | la campana |
| 5 | Una pizca de motera (la foto) | la moto |
| 6 | Una dosis extra de valentía (Danielito y el título) | a Dayana: birrete de psicóloga |
| 7 | Unos años en el rancho | el letrero |
| 8 | Una sorpresa de 2021: Aslei | a los pequeños |
| 9 | Una casa buscada entre tres | el letrero "SE ARRIENDA" |
| 10 | De Villagarzón a Mocoa | la nube: llueve, "¿me puedo quedar?" |
| 11 | Revolver con cariño | la olla 4 veces: salen las fotos |
| 12 | ¡Al horno durante 25 años! | las velitas (o soplar al micrófono) |
| 13 | Nota del chef (la carta) | ver otra vez / descargar la película |

**Descargar el video:** el botón "⬇ video" graba la película completa (~2,5 min, vertical 720×1280, con música) y la descarga. En Chrome/Edge sale en `.mp4`; en otros navegadores puede salir en `.webm`. Hay que dejar la pestaña abierta mientras graba.

**Cambiar textos:** todo lo que se lee está en [`js/content.js`](js/content.js). Los colores de pelo y piel de cada muñequito están al inicio de [`js/scenes.js`](js/scenes.js).

**Fotos:** `assets/fotos/` (moto.jpeg, juntos-1.jpeg, juntos-2.jpeg).

**Verla / compartirla:** las fotos y la grabación necesitan que la página se sirva por http (no abriendo el archivo con doble clic). Lo más fácil es GitHub Pages: *Settings → Pages → Deploy from a branch → `main` / root*, y el enlace queda como `https://yadirtf.github.io/happybirthday/`. Para probar en el computador: `python3 -m http.server` dentro de la carpeta y abrir `http://localhost:8000`.

**Previa al compartir el enlace (WhatsApp):** la imagen es [`assets/og.jpg`](assets/og.jpg) (1200×630). Se dibuja con [`tools/og.html`](tools/og.html) usando los mismos crayones. Las etiquetas `og:` de `index.html` apuntan a `https://happybirthday-dayana.vercel.app`; si cambia el dominio, hay que cambiarlo ahí.
