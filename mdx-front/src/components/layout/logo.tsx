import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Mermãs Digitais"
      className="inline-flex shrink-0 rounded-lg focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
    >
      <img
        src="/marca/logo-mermas.svg"
        alt=""
        width={105}
        height={38}
        className="h-10 w-auto sm:h-11"
      />
    </Link>
  );
}
