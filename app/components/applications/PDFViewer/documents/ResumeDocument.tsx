/* eslint-disable @next/next/no-img-element */
import email from '@/app/utils/commands/email';

const ResumeDocument = () => {
  const decodedEmail = email().replace('mailto:', '');

  return (
    <div className="space-y-4 text-slate-800 px-8 py-6">
      <header className="space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Resume
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Matt Breckon
            </h1>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-slate-600 underline">
              https://matthewbreckon.com
            </p>
            <p className="text-xs text-slate-600 print-email">{decodedEmail}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Software Engineer — Web developer, application architect, systems
          engineer
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Experience
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <img
                src="/images/omers-logo.png"
                alt="OMERS"
                className="w-8 h-8 rounded"
              />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">OMERS</h3>
                <p className="text-xs text-slate-500">
                  Toronto, Ontario, Canada
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Typescript • React • Next.js • Node • Design Systems • UI/UX •
                  React Native / Expo
                  <br />
                  Cloud • Datadog • Docker • Springboot • PostgresSQL • CMS
                  <br />
                  Applications and Systems Architecture • Framework and Internal
                  Devtool Development
                  <br />
                  Unit, Integration, and E2E Testing • Functional Programming
                  <br />
                  Management • Mentored Software Engineers
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-medium text-slate-800">
                    Senior Staff Software Engineer
                  </h4>
                  <p className="text-xs text-slate-500">Jan 2024 - Present</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Internal application/systems development and architecture
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-medium text-slate-800">
                    Staff Software Engineer / Manager
                  </h4>
                  <p className="text-xs text-slate-500">Jan 2022 - Jan 2024</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Internal application/systems development and architecture
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Managed upwards of 10 junior, intermediate, and senior
                  software developers
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-medium text-slate-800">
                    Lead Front-End Engineer / Manager
                  </h4>
                  <p className="text-xs text-slate-500">Jan 2021 - Jan 2022</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Internal application/systems development
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Managed upwards of 5 junior and intermediate software
                  developers
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-medium text-slate-800">
                    Senior Full-Stack Engineer
                  </h4>
                  <p className="text-xs text-slate-500">Mar 2020 - Jan 2021</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  e-access external employer application development
                </p>
              </div>
            </div>
          </div>

          <div className="w-3/4 mx-auto border-t border-slate-300" />

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <img
                src="/images/cibc-logo.png"
                alt="CIBC"
                className="w-8 h-8 rounded"
              />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">CIBC</h3>
                <p className="text-xs text-slate-500">
                  Toronto, Ontario, Canada
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Javascript • Angular • Node • SQL • Mongo
                  <br />
                  Unit and Integration Testing
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-medium text-slate-800">
                    Senior Full-Stack Software Developer
                  </h4>
                  <p className="text-xs text-slate-500">Jan 2019 - Mar 2020</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Internal talent management application development
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-medium text-slate-800">
                    Full-Stack Software Developer
                  </h4>
                  <p className="text-xs text-slate-500">Jan 2017 - Jan 2019</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  CIBC SmartBanking for Business application development
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-3/4 mx-auto border-t border-slate-300" />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
          Education
        </h2>

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <img
              src="/images/uofg-logo.png"
              alt="University of Guelph"
              className="w-8 h-8 rounded"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    University of Guelph
                  </h3>
                  <p className="text-sm text-slate-700">
                    Bachelor&apos;s Degree, Honours, Computer Science
                  </p>
                </div>
                <p className="text-xs text-slate-500">2014 - 2017</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img
              src="/images/ryerson-logo.png"
              alt="Ryerson University"
              className="w-8 h-8 rounded"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Ryerson University
                  </h3>
                  <p className="text-sm text-slate-700">Computer Engineering</p>
                </div>
                <p className="text-xs text-slate-500">2011 - 2014</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResumeDocument;
