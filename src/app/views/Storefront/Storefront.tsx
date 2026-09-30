export function Storefront() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-stretch md:px-8 md:py-14">
        <div className="flex flex-col justify-end">
          <p className="font-display text-sm font-medium tracking-widest text-primary uppercase">
            Escaparate
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold text-foreground md:text-5xl">
            Compra fácil, con una tienda pensada para ti.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Explora el escaparate a tu ritmo. Entrar con Google es opcional y no bloquea la visita.
          </p>
        </div>

        <div className="grid gap-4">
          <article className="rounded-2xl bg-primary p-6 text-on-primary">
            <h2 className="font-display text-2xl font-semibold">Mira con calma</h2>
            <p className="mt-2 text-base leading-relaxed">
              La tienda se recorre entera sin crear una cuenta.
            </p>
          </article>
          <article className="rounded-2xl bg-accent p-6 text-on-accent">
            <h2 className="font-display text-2xl font-semibold">Entra si quieres</h2>
            <p className="mt-2 text-base leading-relaxed">
              Google está en la cabecera y no corta la visita.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3 md:gap-6 md:px-8">
        <article className="rounded-2xl border-2 border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Sin fricción</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Quien no entra sigue mirando la tienda con normalidad.
          </p>
        </article>
        <article className="rounded-2xl border-2 border-foreground bg-foreground p-6 text-background">
          <h2 className="font-display text-xl font-semibold">Una acción clara</h2>
          <p className="mt-2 leading-relaxed">
            Entrar o salir vive en la cabecera, siempre a la mano.
          </p>
        </article>
        <article className="rounded-2xl border-2 border-border bg-muted p-6">
          <h2 className="font-display text-xl font-semibold text-foreground">La misma persona</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Si entras, sales también de la sesión del panel.
          </p>
        </article>
      </section>
    </>
  );
}
