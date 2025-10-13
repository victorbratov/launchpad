import { PitchCard } from "@/components/pitch_preview_card"
import { RAGGauge } from "@/components/rag_gauge"
import { FundsDialog } from "@/components/funds_dialog"
import Navbar from "@/components/Navbar"
import { render, waitFor } from "@testing-library/react"
import { createMockPitch, resetAllMocks } from "@/lib/test-utils"

beforeEach(() => {
  resetAllMocks()
})
it("navbar", () => {
  const tree = render(<Navbar />)
  expect(tree).toMatchSnapshot()
})

it("pitch-card", async () => {
  const testPitch = createMockPitch()
  const tree = render(<PitchCard pitch={testPitch}></PitchCard>)
  
  await waitFor(() => {
    expect(tree.container).toBeInTheDocument()
  })
  
  expect(tree).toMatchSnapshot()
})

it("pitch-card-with-media", async () => {
  const testPitch = createMockPitch({
    product_title: "Product with Media",
    elevator_pitch: "This pitch has media content for testing.",
  })
  
  const { fetchFeaturedMedia } = require("@/lib/s3_utils")
  fetchFeaturedMedia.mockResolvedValue("https://example.com/test-image.jpg")
  
  const tree = render(<PitchCard pitch={testPitch}></PitchCard>)
  
  await waitFor(() => {
    expect(tree.container.querySelector('img')).toBeInTheDocument()
  })
  
  expect(tree).toMatchSnapshot()
})

it("pitch-card-video-media", async () => {
  const testPitch = createMockPitch({
    product_title: "Product with Video",
    elevator_pitch: "This pitch has video content for testing.",
  })
  
  const { fetchFeaturedMedia } = require("@/lib/s3_utils")
  fetchFeaturedMedia.mockResolvedValue("https://example.com/test-video.mp4")
  
  const tree = render(<PitchCard pitch={testPitch}></PitchCard>)
  
  await waitFor(() => {
    expect(tree.container.querySelector('video')).toBeInTheDocument()
  })
  
  expect(tree).toMatchSnapshot()
})

it("rag-gauge-red", () => {
  const tree = render(<RAGGauge ragScore="Red" />)
  expect(tree).toMatchSnapshot()
})

it("rag-gauge-amber", () => {
  const tree = render(<RAGGauge ragScore="Amber" />)
  expect(tree).toMatchSnapshot()
})

it("rag-gauge-green", () => {
  const tree = render(<RAGGauge ragScore="Green" />)
  expect(tree).toMatchSnapshot()
})

it("funds-dialog-deposit", () => {
  const tree = render(
    <FundsDialog 
      mode="deposit" 
      balance={1000} 
      onSubmit={jest.fn()} 
    />
  )
  expect(tree).toMatchSnapshot()
})

it("funds-dialog-withdraw", () => {
  const tree = render(
    <FundsDialog 
      mode="withdraw" 
      balance={1000} 
      onSubmit={jest.fn()} 
    />
  )
  expect(tree).toMatchSnapshot()
})
