/**
 * Invest View Page
 *
 * Displays all investments the user has made.
 * Includes a Navbar, investment table, and pagination.
 */

{/*This is the invest view page*/}
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01' //Navbar for investors. Links to Pitchview, Discover pages, Wallet, displays funds, and logout function
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { // Pagnation to be used to change through pages when function added
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

{/* Imports table from invest table to test display features */}
import { investData } from "@/Data/investData"


const Example = () => (
  <div className="relative w-full min-h-screen bg-gray-50">
    {/* Navbar at the top */}
    <Navbar01 />

<main className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-sm bg-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Invested Pitches</h1>
         <Table>
          <TableCaption>All investments you’ve made so far</TableCaption>
          <TableHeader>
            {/* Headers for each table segment */}
            <TableRow>
              <TableHead className="w-1/4 text-left text-black">Title</TableHead>
              <TableHead className="w-1/4 text-center text-black">ROI</TableHead>
              <TableHead className="w-1/4 text-right text-black">Tier</TableHead>
              <TableHead className="w-1/4 text-right text-black">Progress</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
               {/* displays investdata */}
            {investData.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="w-1/4 text-left text-black">{item.title}</TableCell>
                <TableCell className="w-1/4 text-center text-black">{item.roi}</TableCell>
                <TableCell className="w-1/4 text-right text-black">{item.tier}</TableCell>
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
