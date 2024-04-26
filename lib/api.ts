export const fetchData = async (query: string) => {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzRlYzkzMTktMWJhMC00YmM1LWFhODEtNWRhNzY2YjVlNWM3IiwidHlwZSI6ImFwaV90b2tlbiJ9.gMKJohWm-S_nTN8QaYbLupDsglPd-p2bST_zDaeLWT8'
    },
    body: JSON.stringify({
      response_as_dict: true,
      attributes_as_list: false,
      show_original_response: false,
      temperature: 0,
      max_tokens: 1000,
      instruction:
        '"You are a excellent HTML and CSS coder. Provide the codes you wrote with html and css separately. just do what you\'re told, Just write the code and don\'t write any explanations or sentences.",',
      prompt: `${query}`,
      providers: 'openai'
    })
  }

  try {
    const response = await fetch(
      'https://api.edenai.run/v2/text/code_generation',
      options
    )
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
