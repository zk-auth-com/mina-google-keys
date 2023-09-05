import { Run } from "./server.js";
import { updateEmail, sendTxs } from "./contract.js";

interface signature {
  r: string;
  s: string;
}

const main = async () => {
  // const tx = await updateEmail("pashaklybik@gmail.com")
  const sign = {
    r: "3363833629330128233651788224576693951330222458872860775675028016856115168133",
    s: "25690860517388675946198652643138055228491779636793399414315724874831248703777",
  } as signature;
  const tx = await sendTxs(
    "pashaklybik@gmail.com",
    "B62qo2mibtGCPUWTfHbaLFaQo4po1RQoAyC8kfgNNYTsNxHe173FSN2",
    10000000,
    sign
  );
  console.log(tx);
  await Promise.all([Run()]);
};

main().catch(console.error);
