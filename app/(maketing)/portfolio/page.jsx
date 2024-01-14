
import PortfolioComponent from "@/components/portfolio-component"

/*
export const metadata = {
  title: "Portfolio Page",
}
*/

export default async function PortfolioPage() {

  const state = await getState();
  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
    

      <PortfolioComponent state={state} />
     
    </div>
  )
}

 async function getState() {
  const response = await fetch("https://oracle.utxo.dev", {
      method: "POST",
      headers: {
          'Content-Type': 'application/json', 
          Accept: 'application/json'
      },
      body: JSON.stringify({
          "jsonrpc": "2.0",
          "id": "id",
          "method": "read_contract_state",
          "params": {
            "contract_id": "liquidium",
          }
      }),
    });

    const result = await response.json();

    const state = JSON.parse(result.result);

    return state
}