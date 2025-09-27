{/*This is the invest view page*/}
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"


const Example = () => (
  <div className="relative w-full min-h-screen bg-gray-50">
    {/* Navbar at the top */}
    <Navbar01 />

<main className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="max-w-4xl mx-auto mt-10 p-6 border rounded-lg shadow-sm bg-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Invested Pitches</h1>
        <Table>
          <TableCaption>...</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4 text-left text-black">Title</TableHead>
              <TableHead className="w-1/4 text-center text-black">ROI</TableHead>
              <TableHead className="w-1/4 text-right text-black">Tier</TableHead>
              <TableHead className="w-1/4 text-right text-black">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="w-1/4 text-left text-black">Fresh Avocado</TableCell>
              <TableCell className="w-1/4 text-center text-black">£12.00</TableCell>
              <TableCell className="w-1/4 text-right text-black">Bronze Tier</TableCell>
              <TableCell className="w-1/4 text-right text-black">Completed</TableCell>
            </TableRow>
            <TableRow className="border-b border-gray-300 h-16" />
            <TableRow>
              <TableCell className="w-1/4 text-left text-black">Fresh Avocado</TableCell>
              <TableCell className="w-1/4 text-center text-black">£12.00</TableCell>
              <TableCell className="w-1/4 text-right text-black">Bronze Tier</TableCell>
              <TableCell className="w-1/4 text-right text-black">Completed</TableCell>
            </TableRow>
            <TableRow className="border-b border-gray-300 h-16" />
            <TableRow>
              <TableCell className="w-1/4 text-left text-black">Fresh Avocado</TableCell>
              <TableCell className="w-1/4 text-center text-black">£12.00</TableCell>
              <TableCell className="w-1/4 text-right text-black">Bronze Tier</TableCell>
              <TableCell className="w-1/4 text-right text-black">Completed</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-6">
          <Pagination>
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
