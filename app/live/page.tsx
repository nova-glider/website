import { ModeToggle } from "@/components/ui/mode-toggle";
import { Blockquote, Header2 } from "@/components/ui/typography";

export default function Live() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen max-w-md mx-auto">
        <div className="mb-4">
          <Header2>Under Construction</Header2>
        </div>
        <Blockquote>
          {/* "Patience, you must have, my young Padawan." <br /> - Yoda 
            Apparently this quote isnt actually in the movies lol */}
            
          "This is only the beginning." <br /> ~ Winston Churchill
        </Blockquote>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
    </div>
  );
}
