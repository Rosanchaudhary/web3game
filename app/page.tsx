import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#282C33] text-white font-mono">
      {/*<!-- Navbar */}
      <header className="flex items-center justify-between px-6 md:px-20 py-6">
        <div className="text-lg font-semibold">Roshan</div>
        <nav className="hidden md:flex space-x-6 text-sm text-gray-300">
          <a href="#about-me" className="hover:text-accent">
            about-me
          </a>
          <a href="#projects" className="hover:text-accent">
            works
          </a>
          <a href="#contacts" className="hover:text-accent">
            contacts
          </a>
          <a href="#skills" className="hover:text-accent">
            skills
          </a>

          <span className="text-accent">EN</span>
        </nav>
      </header>

      {/*<!-- Hero */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 px-6 md:px-20 py-20">
        <div className="max-w-lg">
          <h1 className="text-3xl leading-snug">
            Roshan is a<span className="text-accent">Computer Engineer</span>
            and
            <span className="text-accent">Full-Stack Developer</span>
          </h1>

          <p className="mt-6 text-sm text-textMuted">
            Building AI-driven SaaS solutions and high-performance web
            experiences with 4+ years of professional expertise.
          </p>
          <a
            href="#contacts"
            className="mt-6 border border-accent px-5 py-2 text-sm hover:bg-accent hover:text-bg transition hover:shadow-[0_0_20px_#C778DD]"
          >
            Contact me →
          </a>
        </div>

        <div className="relative">
          <Image
            height={100}
            width={100}
            alt=""
            src="/images/image.png"
            className="w-72 md:w-80 rounded grayscale hover:grayscale-0 transition"
          />
          <div className="mt-3 flex items-center gap-2 border border-textMuted px-3 py-2 text-xs text-textMuted">
            <span className="h-2 w-2 rounded-full bg-accent"></span>
            Currently working on Portfolio
          </div>
        </div>
      </section>

      {/*<!-- Quote */}
      <section className="mx-6 md:mx-auto my-16 max-w-xl border border-textMuted px-6 py-6 text-center">
        <p>“ With great power comes great electricity bill ”</p>
        <span className="mt-3 block text-textMuted">- Dr. Who</span>
      </section>

      {/*<!-- Projects */}
      <section id="projects" className="px-6 md:px-20 py-20">
        {/*<!-- Title */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-accent">#projects</h2>
            <div className="h-px w-32 md:w-64 bg-accent opacity-50"></div>
          </div>

          <a
            href="#"
            className="text-xs text-textMuted hover:text-accent transition"
          >
            View all →
          </a>
        </div>

        {/*<!-- Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/*<!-- Card */}
          <div className="border border-textMuted">
            <Image
              height={100}
              width={100}
     
              src="/images/harry.png"
              alt="Project"
              className="h-40 w-full object-cover"
            />

            <div className="p-4 border-t border-textMuted">
              <p className="text-xs text-textMuted mb-2">
                Next Express Mongo Langchain
              </p>

              <h3 className="text-base mb-1">Hire Smart</h3>
              <p className="text-xs text-textMuted mb-4">Personal Co Worker</p>

              <div className="flex gap-3">
                <a
                  href="https://www.hireharry.ai/"
                  className="border border-accent px-3 py-1 text-xs hover:bg-accent hover:text-bg transition"
                >
                  Live ⇀
                </a>
                <a
                  href="https://www.hireharry.ai/"
                  className="border border-textMuted px-3 py-1 text-xs hover:border-accent hover:text-accent transition"
                >
                  Cached →
                </a>
              </div>
            </div>
          </div>

          {/*<!-- Card */}
          {/*<!-- <div className="border border-textMuted">
          <iImage
          height={100}
          width={100}
          alt=""
            src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80"
            alt="Project"
            className="h-40 w-full object-cover"
          />

          <div className="p-4 border-t border-textMuted">
            <p className="text-xs text-textMuted mb-2">
              React Express Discord.js Node.js
            </p>

            <h3 className="text-base mb-1">ProtectX</h3>
            <p className="text-xs text-textMuted mb-4">Discord anti-crash bot</p>

            <div className="flex gap-3">
              <a
                href="#"
                className="border border-accent px-3 py-1 text-xs hover:bg-accent hover:text-bg transition"
              >
                Live ⇀
              </a>
            </div>
          </div>
        </div> */}

          {/*<!-- Card */}
          {/*<!-- <div className="border border-textMuted">
          <iImage
          height={100}
          width={100}
          alt=""
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
            alt="Project"
            className="h-40 w-full object-cover"
          />

          <div className="p-4 border-t border-textMuted">
            <p className="text-xs text-textMuted mb-2">CSS Express Node.js</p>

            <h3 className="text-base mb-1">Kahoot Answers Viewer</h3>
            <p className="text-xs text-textMuted mb-4">
              Get answers to your kahoot quiz
            </p>

            <div className="flex gap-3">
              <a
                href="#"
                className="border border-accent px-3 py-1 text-xs hover:bg-accent hover:text-bg transition"
              >
                Live ⇀
              </a>
            </div>
          </div>
        </div> */}
        </div>
      </section>

      {/*<!-- Skills */}
      <section id="skills" className="px-6 md:px-20 py-20">
        {/*<!-- Title */}
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-xl text-accent">#skills</h2>
          <div className="h-px flex-1 bg-accent opacity-50"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/*<!-- Left decorations */}
          <div className="relative hidden md:block">
            {/*<!-- dots */}
            <div className="grid grid-cols-4 gap-2 absolute top-0 left-0">
              <span className="w-1 h-1 bg-textMuted"></span>
              <span className="w-1 h-1 bg-textMuted"></span>
              <span className="w-1 h-1 bg-textMuted"></span>
              <span className="w-1 h-1 bg-textMuted"></span>
            </div>

            {/*<!-- squares */}
            <div className="absolute top-24 left-16 w-16 h-16 border border-accent"></div>
            <div className="absolute top-44 left-4 w-10 h-10 border border-textMuted"></div>
            <div className="absolute top-60 left-32 w-12 h-12 border border-textMuted"></div>
          </div>

          {/*<!-- Skills cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/*<!-- Card */}
            <div className="border border-textMuted p-3">
              <h3 className="text-sm mb-2">Languages</h3>
              <p className="text-xs text-textMuted">
                TypeScript JavaScript
                <br />
                Python Dart
              </p>
              <p className="text-xs text-textMuted">
                C C++
                <br />
                Rust
              </p>
            </div>

            <div className="border border-textMuted p-3">
              <h3 className="text-sm mb-2">Databases</h3>
              <p className="text-xs text-textMuted">
                SQLite PostgreSQL
                <br />
                Mongo
              </p>
            </div>

            <div className="border border-textMuted p-3">
              <h3 className="text-sm mb-2">Tools</h3>
              <p className="text-xs text-textMuted">
                VSCode Neovim Linux
                <br />
                Figma XFCE Arch
                <br />
                Git Font Awesome
              </p>
            </div>

            <div className="border border-textMuted p-3">
              <h3 className="text-sm mb-2">Other</h3>
              <p className="text-xs text-textMuted">
                HTML CSS JS SCSS
                <br />
                REST Jinja
              </p>
            </div>

            <div className="border border-textMuted p-3 sm:col-span-2">
              <h3 className="text-sm mb-2">Frameworks</h3>
              <p className="text-xs text-textMuted">
                React Next.js
                <br />
                Django
                <br />
                Express.js
              </p>
            </div>
          </div>
        </div>
      </section>
      {/*<!-- About */}
      <section id="about-me" className="px-6 md:px-20 py-20">
        {/*<!-- Title */}
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-xl text-accent">#about-me</h2>
          <div className="h-px flex-1 bg-accent opacity-50"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/*<!-- Text */}
          <div className="text-sm text-textMuted leading-relaxed space-y-4 max-w-lg">
            <p>Hello, I’m Roshan!</p>
            <p>
              I am a Computer Engineer and Full-Stack Developer based in Nepal,
              specializing in the MERN stack and AI integration. With over 4
              years of professional experience, I don&apos;t just build websites—I
              build scalable digital products.
            </p>
            <p>
              From developing AI-driven hiring platforms at HireHarry.ai to
              creating high-performance game engines with PixiJS, I focus on
              turning complex technical requirements into smooth, user-friendly
              experiences. Whether it’s stabilizing a messy SaaS codebase or
              implementing generative AI, I bridge the gap between robust
              engineering and pragmatic design.
            </p>

            <a
              href="#"
              className="inline-block mt-4 border border-accent px-5 py-2 text-sm text-white hover:bg-accent hover:text-bg transition hover:shadow-[0_0_20px_#C778DD]"
            >
              Read more →
            </a>
          </div>

          {/*<!-- Decoration / Image */}
          <div className="relative hidden md:block">
            {/*<!-- dots */}
            <div className="grid grid-cols-4 gap-2 absolute top-4 right-12">
              <span className="w-1 h-1 bg-textMuted"></span>
              <span className="w-1 h-1 bg-textMuted"></span>
              <span className="w-1 h-1 bg-textMuted"></span>
              <span className="w-1 h-1 bg-textMuted"></span>
            </div>

            {/*<!-- image */}
            <Image
              height={100}
              width={100}

              src="/images/image.png"
              alt="About"
              className="w-72 rounded grayscale hover:grayscale-0 transition"
            />

            {/*<!-- squares */}
            <div className="absolute -top-6 -left-6 w-16 h-16 border border-accent"></div>
            <div className="absolute bottom-4 -right-4 w-10 h-10 border border-textMuted"></div>
          </div>
        </div>
      </section>
      {/*  */}

      {/*<!-- Contacts */}
      <section id="contacts" className="px-6 md:px-20 py-20">
        {/*<!-- Title */}
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-xl text-accent">#contacts</h2>
          <div className="h-px flex-1 bg-accent opacity-50"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/*<!-- Left text */}
          <div className="text-sm text-textMuted max-w-md leading-relaxed">
            <p>
              I’m interested in freelance opportunities. However,
              <br />
              if you have other request or question, don’t
              <br />
              hesitate to contact me
            </p>
          </div>

          {/*<!-- Contact card */}

          <div className="border border-textMuted p-4 w-fit">
            <h3 className="text-sm mb-3">Message me here</h3>

            <ul className="space-y-2 text-xs text-textMuted">
              <li className="flex items-center gap-2">
                {/*<!-- Discord icon */}
                <span>💬</span>
                rosanchaudhary
              </li>
              <li className="flex items-center gap-2">
                {/*<!-- Email icon */}
                <span>✉️</span>
                chaudharyroshan2020@gmail.com
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/*<!-- Footer */}
      <footer className="border-t border-textMuted px-6 md:px-20 py-8 text-sm text-textMuted">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/*<!-- Left */}
          <div>
            <div className="flex items-center gap-2 text-white">
              <span className="font-semibold">Roshan</span>
              <span className="text-xs">chaudharyroshan2020@gmail.com</span>
            </div>
            <p className="mt-2 text-xs">MERN Developer</p>
          </div>

          {/*<!-- Right */}
          <div>
            <h4 className="text-white mb-2">Media</h4>
            <div className="flex gap-4 text-lg">
              <a href="#" className="hover:text-accent transition">
                🐙
              </a>
              <a href="#" className="hover:text-accent transition">
                🐦
              </a>
              <a href="#" className="hover:text-accent transition">
                💬
              </a>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs opacity-60">
          © Copyright 2022. Made by Roshan
        </p>
      </footer>
    </main>
  );
}
