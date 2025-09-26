import { render, screen } from "@testing-library/react";
import ViewMedia from "../app/viewMedia/page";
import * as s3Service from "../app/viewMedia/s3Service";
import '@testing-library/jest-dom'

jest.mock("../app/viewMedia/s3Service");

const mockedFetchMedia = s3Service.fetchMedia as jest.MockedFunction<typeof s3Service.fetchMedia>;

describe("viewMedia component", () => {
  
  beforeEach(() => jest.clearAllMocks());

  // check images and videos are rendered with mock data
  it("renders images and videos", async () => {
    const mockMedia = ["image1.jpg", "video1.mp4"]; // mock media 
    mockedFetchMedia.mockResolvedValue(mockMedia);

    render(<ViewMedia />);

    const images = await screen.findAllByRole("img");
    const videos = await screen.findAllByTestId("video");

    expect(images).toHaveLength(1);

    expect(videos).toHaveLength(1);
  });

  // test when there is no media
  it("renders nothing if no media is returned", async () => {
    mockedFetchMedia.mockResolvedValue([]);

    render(<ViewMedia />);

    const images = screen.queryAllByRole("img");
    const videos = screen.queryAllByRole("video");

    expect(images).toHaveLength(0);
    expect(videos).toHaveLength(0);
  });

  // test fetchMedia is called with correct pitchID
  it("calls fetchMedia with the correct pitchID", async () => {
    mockedFetchMedia.mockResolvedValue([]);
    render(<ViewMedia />);
    expect(mockedFetchMedia).toHaveBeenCalledWith("pitch2");
  });
});
