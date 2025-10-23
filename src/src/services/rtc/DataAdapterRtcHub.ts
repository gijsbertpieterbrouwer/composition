import useDataAdaptersStore from "@/store/dataadapters";
import { ApiAdapterExecutionLog, TickApiAdapterDefinition } from "@/TickApi";
import { RtcHubInstance } from "./RtcHubInstance";


class DataAdapterRtcHub extends RtcHubInstance {

  protected rtcName = "dataAdapterRTC";

  protected subscribeToEvents() {
    this.on("adapterExecutionResult", (log: ApiAdapterExecutionLog) => {
      useDataAdaptersStore().storeTryLog(log);
    });
  }

  public tryDataAdapter(params: TickApiAdapterDefinition) {
    this.call("TryDataAdapter", params);
  }

  protected startSubscription(definitionId: string) {
    console.log("START data-adapter Hub" + definitionId);
  }

  protected endSubscription(definitionId: string) {
    console.log("END data-adapter Hub" + definitionId);
  }

}

export default new DataAdapterRtcHub();
