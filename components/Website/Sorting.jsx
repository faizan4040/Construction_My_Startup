
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sortings } from "@/lib/utils"
import { Button } from "../ui/button"
import { IoFilter } from "react-icons/io5"

const Sorting = ({ limit, setLimit, sorting, setSorting, mobileFilterOpen, setMobileFilterOpen }) => {
 


  return (
  <div className="flex justify-between items-center flex-wrap gap-4 p-4 bg-gray-50">
  <Button type="button" className="lg:hidden" onClick={()=>setMobileFilterOpen(!mobileFilterOpen)}>
    <IoFilter/>
    Filter
  </Button>  

  <ul className="flex items-center gap-4">
    <li className="font-semibold cursor-pointer">Show</li>

    {[9, 12, 18, 24].map(limitNumber => (
      <li key={limitNumber}>
        <button
          type="button"
          onClick={() => setLimit(limitNumber)}
          className={
            limitNumber === limit
              ? "w-8 h-8 flex justify-center items-center rounded-full bg-primary text-white text-sm"
              : "w-8 h-8 flex justify-center items-center rounded-full border text-sm cursor-pointer"
          }
        >
          {limitNumber}
        </button>
      </li>
    ))}
  </ul>

  {/* RIGHT: Select */}
  <div className="w-full sm:w-56">
    <Select value={sorting} onValueChange ={(value) => setSorting(value)}>
      <SelectTrigger className="w-full cursor-pointer">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>default_sorting</SelectLabel>
           {sortings.map(option=>(
             <SelectItem key={option.value} value={option.value}>
              {option.label}
             </SelectItem>
           ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>

</div>


  )
}

export default Sorting