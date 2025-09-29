/**
 * Create Pitch Page
 *
 * Allows users to create a new pitch.
 * Includes media upload, text input, elevator pitch textarea, preview card, and action buttons.
 */

{/*This is the create Pitch page*/}
import Link from "next/link";
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-pitch'//Navbar for investors. Links to Pitchview, Discover pages, Wallet, displays funds, and logout function
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { //Import cards
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { // Dialogue imports to bring up popup box to be used for AI overview
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

{/*export for dialogue closing button*/}
export function DialogCloseButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">

            <Input
              id="link"
              defaultValue="https://ui.shadcn.com/docs/installation"
              readOnly
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

{/*Input for the upload button*/}
export function InputWithButton() {
  return (
    <div className="flex justify-center my-6">
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="email" placeholder="Enter Pitch Name" />
      <Button type="submit" variant="outline" className="bg-white text-black hover:bg-gray-100">
        UPLOAD MEDIA
      </Button>
    </div>
    </div>
  )
}

{/*Export for the textbox feature*/}
export function TextareaDemo() {
  return <Textarea placeholder="Type your message here." />
}


const Example = () => (
  <div className="relative w-full min-h-screen bg-gray-50">
      {/* Navbar at the top */}
      <Navbar01 />


      {/* Visual Box Container */}
      <main className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-sm bg-white">


        <div className="text-black">
          {/* Input and Textarea in a row */}
          <div className="flex flex-col md:flex-row gap-4 h-60">
            {/* Left side: Upload + Image */}
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <InputWithButton />

              <img
                src="/your-image.jpg" // Replace with your image path
                alt="Preview"
                className="w-full h-full object-cover rounded border"
              />
            </div>

            {/* Right side: Textarea */}
            <div className="w-full md:w-1/2">
              <Textarea
                placeholder="Elevator Pitch Here"
                className="h-full min-h-[56px]"
              />
            </div>
          </div>
          
              {/* Middle row: Textbox + Card */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch mt-6 h-100">
              {/* Textbox */}
              <div className="w-full md:w-1/2 h-full">
                <Input placeholder="Full Pitch Here" className="h-full" />
              </div>

              {/* Card */}
              <Card className="w-full h-full md:w-1/2 flex flex-col">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p>Investment info displayed here.</p>
                </CardContent>
              </Card>
          </div>

              
          {/* Button row at bottom */}
          <div className="flex justify-center gap-8 mt-16">
            <Button asChild variant="outline" className="w-40 py-3 px-6 text-lg bg-white">
              <Link href="/pitchview">Return</Link>
            </Button>

              {/* Link button for return */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-white py-3 px-6 text-lg w-40">
                    GET RATING
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    {/* AI Rating will go here when implemented */}
                    <DialogTitle>AI RATING: NONEXISTANT</DialogTitle>
                    <DialogDescription>
                      AI rating will go here!.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

            {/* Third button that will submit form */}
              <Button variant="outline" className="bg-white py-3 px-6 text-lg w-40">
                Okay
              </Button>
          </div>

              
        </div>
      </main>
  </div>
)


export default Example
