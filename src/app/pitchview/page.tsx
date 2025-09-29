/**
 * Pitch View Page
 *
 * Displays a list of business pitches in a table.
 * Includes a navbar, table of pitches, and pagination controls.
 */

//List of imports for various functions
import Link from "next/link"; //Import link function for switching pages
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-pitch' //Navbar for investors. Links to Pitchview, Discover pages, Wallet, displays funds, and logout function
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {  // Pagnation to be used to change through pages when function added
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { businessData } from "@/Data/businessData"



const Example = () => (
  <div className="relative w-full min-h-screen bg-gray-50">
    {/* Navbar at the top */}
    <Navbar01 />

    <main className="flex-1 p-6 max-w-4xl mx-auto w-full">

      <div className="mt-10 p-6 border rounded-lg shadow-sm bg-white">
    <div className="flex items-center justify-between mb-6">
    <h1 className="text-4xl font-bold text-gray-900">Your Pitches</h1>
<Link
            href="/pitchcreate"
            className="bg-white border border-gray-300 shadow-sm text-gray-800 px-4 py-2 rounded hover:shadow-md hover:border-gray-400 transition"
          >
            Create Pitch
          </Link>
  </div>

              <Table>
          <TableCaption>...</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4 text-left text-black">Title</TableHead>
              <TableHead className="w-1/4 text-right text-black">Progress</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {businessData.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="w-1/4 text-left text-black">{item.title}</TableCell>
                <TableCell className="w-1/4 text-right text-black">{item.progress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6">
          <Pagination>
           {/* Pagination list */}
            <PaginationContent className="text-black">
              <PaginationItem>
                <PaginationPrevious className="text-black" href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink className="text-black" href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis className="text-black" />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext className="text-black" href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </main>
  </div>
)

export default Example
