import { IMAGES } from '@/routes/AllImages'
import dayjs from 'dayjs'
import Image from 'next/image'
import relativeTime from 'dayjs/plugin/relativeTime'
import { FaStar } from 'react-icons/fa'

dayjs.extend(relativeTime)

const Reviewlist = ({ review }) => {
  return (
    <div className="flex gap-4 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">

      {/* Avatar */}
      <div className="shrink-0">
        <Image
          src={review?.avatar?.url || IMAGES.profile}
          width={48}
          height={48}
          alt="user icon"
          className="rounded-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">

        {/* Title */}
        <h4 className="text-base font-semibold text-gray-900">
          {review?.title}
        </h4>

        {/* User + time */}
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-800">
            {review?.reviewedBy}
          </span>
          
          {" · "}
          {dayjs(review?.createdAt).fromNow()}
          <span>{review.rating}</span>
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`text-sm ${
                star <= review?.rating
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Review text */}
        <p className="mt-2 text-gray-700 leading-relaxed">
          {review?.review}
        </p>
      </div>
    </div>
  )
}

export default Reviewlist
