{/* This is the page for Invest Discover */}
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"


export function InputWithButton() {
  return (
    <div className="flex justify-center my-6">
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          type="email"
          placeholder="Search"
          className="text-gray-800 border-2 border-white focus:ring-0 focus:border-white"
        />
        <Button
          type="submit"
          variant="outline"
          className="border-2 border-white bg-white-100 text-gray-800 hover:bg-gray-100"
        >
          🔎
        </Button>
      </div>
    </div>
  )
}


const Example = () => (
  <div className="relative w-full min-h-screen bg-gray-50">
    {/* Navbar at the top */}
    <Navbar01 />

    <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-sm bg-white">


    <InputWithButton />

<div className="flex justify-center px-4">
    {/* Cards to be displayed*/}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4">
      {[1, 2, 3, 4, 5, 6].map((item) => (
<Card
  key={item}
  className="w-60 flex flex-col p-0 shadow-md overflow-hidden rounded-lg"
>
  {/* Green Header with Pitch Title */}
  <div style={{ backgroundColor: "#81B788" }} className="px-4 py-2">
    <h3 className="text-white text-lg font-semibold">Pitch Title</h3>
  </div>

  {/* Image */}
<CardHeader className="p-0">
    <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded text-sm text-gray-500">
      Image Placeholder
    </div>
  </CardHeader>

  {/* Word info*/}
<div className="flex flex-col flex-grow px-4 py-1">
    <CardContent className="p-0 mb-2">
      <p className="text-sm text-gray-700">
        Elevator Pitch. This text can be longer and the card will expand in height to accommodate it without clipping.
      </p>
    </CardContent>

<CardFooter className="p-0 pt-2 mt-auto flex flex-col items-center">
  <p className="text-base mt-1 text-gray-500">40/100</p>
  <p className="text-xs mt-1 text-gray-500">100%</p>
</CardFooter>
  </div>
</Card>

      ))}
    </div>
</div>


    <footer className="w-full p-6">
      <div className="max-w-4xl mx-auto">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </footer>
    </div>
    </div>
)



export default Example
