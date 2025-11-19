import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorComponentProps {
  className?: string;
}

const networkError = (
  <p>
    We couldn&apos;t reach the API, <br />
    please check if you have an internet connection.
  </p>
);

const dataEmptyError = (
  <p>
    There is no data available at the moment.
    {/* <br />
    <br />
    If you believe this is an error, please{" "}
    <Link
      href="https://novaglider.mooo.com/#cards-grid"
      className="underline underline-offset-4 hover:text-primary"
      target="_blank"
    >
      contact us
    </Link>
    . */}
  </p>
);

export default function ErrorComponent({ className }: ErrorComponentProps) {
  return (
    <Alert variant="destructive" className={className}>
      {/* <AlertTitle></AlertTitle> */}
      <AlertDescription>
        {typeof window !== "undefined" && navigator.onLine
          ? dataEmptyError
          : networkError}
      </AlertDescription>
    </Alert>
  );
}
