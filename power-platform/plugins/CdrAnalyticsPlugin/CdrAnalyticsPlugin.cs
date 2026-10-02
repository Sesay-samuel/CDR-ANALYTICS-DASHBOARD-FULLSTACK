using System;
using Microsoft.Xrm.Sdk;

namespace CdrAnalyticsPlugin
{
    public class CdrAnalyticsPlugin : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new ArgumentNullException(nameof(serviceProvider));
            }

            ITracingService tracingService =
                (ITracingService)serviceProvider.GetService(
                    typeof(ITracingService));

            IPluginExecutionContext context =
                (IPluginExecutionContext)serviceProvider.GetService(
                    typeof(IPluginExecutionContext));

            try
            {
                tracingService.Trace(
                    "CDR Analytics Plugin execution started.");

                if (!context.InputParameters.Contains("Target") ||
                    !(context.InputParameters["Target"] is Entity target))
                {
                    tracingService.Trace(
                        "No valid Target entity was supplied.");

                    return;
                }

                tracingService.Trace(
                    "Processing entity: {0}",
                    target.LogicalName);

                /*
                 * The plugin will eventually contain our CDR-specific
                 * Dataverse validation and processing logic.
                 *
                 * We are intentionally starting with the plugin execution
                 * framework first so it can be unit tested before adding
                 * Dataverse table-specific fields.
                 */

                tracingService.Trace(
                    "CDR Analytics Plugin execution completed successfully.");
            }
            catch (Exception ex)
            {
                tracingService.Trace(
                    "CDR Analytics Plugin error: {0}",
                    ex);

                throw new InvalidPluginExecutionException(
                    "An error occurred while processing CDR analytics.",
                    ex);
            }
        }
    }
}