import { useQueryClient } from "@tanstack/react-query"

function invalidateQueries() {
  const queryClient = useQueryClient()

  function invalidate() {
    queryClient.invalidateQueries()
  }

  return invalidate

}

export default invalidateQueries