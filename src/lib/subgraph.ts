import axios, { RawAxiosRequestHeaders } from 'axios';

export async function tryQueryBlockMeta(endpoint: string): Promise<number> {
  let blockNumber = 0;

  do {
    try {
      const response = await axios.post(
        endpoint,
        {
          query: `
              {
                _meta {
                  block {
                    number
                  }
                }
              }
            `,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          } as RawAxiosRequestHeaders,
        },
      );
      if (response.data.data) {
        blockNumber = Number(response.data.data._meta.block.number);
      }
    } catch (e: any) {}
  } while (blockNumber === 0);

  return blockNumber;
}
