import { useState, type FormEvent } from "react";
import { Mail, ArrowUpRight, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  subject: z.string().trim().min(2, "Subject is too short").max(120),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
});

const SUPPORT_EMAIL = "support@subforme.com";

export default function ContactSection() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);

    const { name, email, subject, message } = parsed.data;
    const body = `From: ${name} <${email}>%0D%0A%0D%0A${encodeURIComponent(message)}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `[Subforme] ${subject}`,
    )}&body=${body}`;
    toast.success("Drafting your message…");
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section
      id="contact"
      className="relative border-t-2 border-ink bg-paper-deep"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:gap-8 md:px-10 md:py-20">

        <aside className="md:col-span-4">
          <p className="font-mono-display text-[11px] uppercase tracking-[0.25em] text-print-red">
            ▍ Letters to the Editor
          </p>
          <h2
            id="contact-heading"
            className="mt-4 font-editorial text-4xl leading-[0.95] tracking-tight md:text-5xl"
          >
            Questions or feedback? <span className="italic text-print-red">We'd love to hear from you.</span>
          </h2>
          <p className="mt-5 max-w-sm font-mono-display text-sm leading-relaxed text-ink/70">
            Support, partnerships, or press inquiries. Drop a note and the right
            desk will get back within one business day.
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="group flex items-center gap-3 border-2 border-ink bg-paper px-4 py-3 shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4" />
              <span className="font-mono-display text-sm">{SUPPORT_EMAIL}</span>
              <ArrowUpRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="flex items-center gap-3 px-4 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-ink/70">
              <Clock className="h-3.5 w-3.5" />
              Mon-Fri · 09:00-18:00 WAT
            </div>
            <div className="flex items-center gap-3 px-4 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-ink/70">
              <MessageSquare className="h-3.5 w-3.5" />
              Avg. response · under 24 hrs
            </div>
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="md:col-span-8 border-2 border-ink bg-paper p-6 shadow-brutal md:p-10"
          noValidate
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Name" name="name" placeholder="Ada Lovelace" maxLength={80} />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@domain.com"
              maxLength={160}
            />
          </div>
          <div className="mt-5">
            <Field
              label="Subject"
              name="subject"
              placeholder="Support request, partnership, press…"
              maxLength={120}
            />
          </div>
          <div className="mt-5">
            <label className="mb-2 block font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/70">
              Message
            </label>
            <textarea
              name="message"
              rows={6}
              maxLength={2000}
              placeholder="Tell us what's on your mind."
              className="w-full resize-y border-2 border-ink bg-paper px-4 py-3 font-mono-display text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="mt-7 flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
            <p className="font-mono-display text-[11px] uppercase tracking-[0.2em] text-ink/60">
              By submitting you agree to be contacted at the email provided.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex items-center justify-center gap-2 bg-print-orange px-6 py-3 font-mono-display text-sm font-semibold uppercase tracking-wider text-ink shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send message"}
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono-display text-[11px] uppercase tracking-[0.25em] text-ink/70">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border-2 border-ink bg-paper px-4 py-3 font-mono-display text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-0"
      />
    </div>
  );
}
