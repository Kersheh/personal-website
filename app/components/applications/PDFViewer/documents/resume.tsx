import Link from 'next/link';

const ResumeDocument = () => {
  return (
    <div className="space-y-5 text-slate-800">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Profile
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Matt Breckon</h1>
        <p className="text-sm text-slate-600">
          Software Engineer — Web, app architecture, and systems development
        </p>
      </header>

      <section className="space-y-3">
        <p className="text-sm leading-relaxed">
          <span>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </span>{' '}
          <span>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </span>
        </p>
        <p className="text-sm leading-relaxed">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Lorem Ipsum Dolor
        </h2>
        <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
          <li>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque.
          </li>
          <li>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit.
          </li>
          <li>
            Neque porro quisquam est qui dolorem ipsum quia dolor sit amet
            consectetur adipisci velit.
          </li>
          <li>
            Ut enim ad minima veniam quis nostrum exercitationem ullam corporis
            suscipit laboriosam.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">Consectetur</h2>
        <p className="text-sm text-slate-700">
          Temporibus autem quibusdam et aut officiis debitis aut rerum
          necessitatibus saepe eveniet ut et voluptates.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
        <p className="text-sm text-slate-700">
          Email:{' '}
          <Link href="mailto:hello@mattbreckon.com" className="underline">
            hello@mattbreckon.com
          </Link>
        </p>
      </section>
    </div>
  );
};

export default ResumeDocument;
