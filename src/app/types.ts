export interface Video {
    source: string;
    ref: string;
    transcoding: boolean;
}

export interface CustomHeaders {
    headers: {
        Authorization: string;
    };
}
