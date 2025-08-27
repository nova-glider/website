"use client";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Toaster } from "@/components/ui/sonner"; // make sure to import from components/ui and not sonner directly

export default function Home() {
  const router = useRouter();

  const promise = () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ name: "timeout" }), 500)
    ).then(() => {
      router.push("/live");
    });

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <AlertDialog defaultOpen={true}>
          {/* <AlertDialogTrigger asChild>
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger> */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Warning</AlertDialogTitle>
              <AlertDialogDescription>
                The NovaCan dashboard is under heavy development and might
                contain hella bugs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
              <AlertDialogAction>I Understand</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="outline"
          onClick={() =>
            toast.promise(promise, {
              loading: "Loading...",
              success: "Redirecting to dashboard!",
              error: "Failed to load dashboard.",
            })
          }
        >
          Enter Dashboard
        </Button>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <Toaster closeButton position="bottom-center" />
    </div>
  );
}
