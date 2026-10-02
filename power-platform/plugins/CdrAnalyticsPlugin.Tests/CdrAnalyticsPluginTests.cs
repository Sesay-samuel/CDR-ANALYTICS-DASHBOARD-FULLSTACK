using System;
using Microsoft.Xrm.Sdk;
using Moq;
using Xunit;

namespace CdrAnalyticsPlugin.Tests
{
    public class CdrAnalyticsPluginTests
    {
        [Fact]
        public void Execute_WithNullServiceProvider_ThrowsArgumentNullException()
        {
            var plugin = new global::CdrAnalyticsPlugin.CdrAnalyticsPlugin();

            Assert.Throws<ArgumentNullException>(
                () => plugin.Execute(null));
        }

        [Fact]
        public void Execute_WithoutTarget_ReturnsWithoutException()
        {
            var tracingService = new Mock<ITracingService>();
            var context = new Mock<IPluginExecutionContext>();

            context
                .SetupGet(x => x.InputParameters)
                .Returns(new ParameterCollection());

            var serviceProvider = CreateServiceProvider(
                tracingService.Object,
                context.Object);

            var plugin = new global::CdrAnalyticsPlugin.CdrAnalyticsPlugin();

            Exception exception = Record.Exception(
                () => plugin.Execute(serviceProvider.Object));

            Assert.Null(exception);

            tracingService.Verify(
                x => x.Trace(
                    It.Is<string>(message =>
                        message.Contains("No valid Target entity"))),
                Times.Once);
        }

        [Fact]
        public void Execute_WithValidTarget_ProcessesEntitySuccessfully()
        {
            var tracingService = new Mock<ITracingService>();
            var context = new Mock<IPluginExecutionContext>();

            var target = new Entity("cdr_record")
            {
                Id = Guid.NewGuid()
            };

            var inputParameters = new ParameterCollection
            {
                { "Target", target }
            };

            context
                .SetupGet(x => x.InputParameters)
                .Returns(inputParameters);

            var serviceProvider = CreateServiceProvider(
                tracingService.Object,
                context.Object);

            var plugin = new global::CdrAnalyticsPlugin.CdrAnalyticsPlugin();

            Exception exception = Record.Exception(
                () => plugin.Execute(serviceProvider.Object));

            Assert.Null(exception);

            tracingService.Verify(
                x => x.Trace(
                    It.Is<string>(message =>
                        message.Contains(
                            "CDR Analytics Plugin execution started"))),
                Times.Once);

            tracingService.Verify(
                x => x.Trace(
                    It.Is<string>(message =>
                        message.Contains(
                            "CDR Analytics Plugin execution completed successfully"))),
                Times.Once);
        }

        private static Mock<IServiceProvider> CreateServiceProvider(
            ITracingService tracingService,
            IPluginExecutionContext context)
        {
            var serviceProvider = new Mock<IServiceProvider>();

            serviceProvider
                .Setup(x => x.GetService(typeof(ITracingService)))
                .Returns(tracingService);

            serviceProvider
                .Setup(x => x.GetService(typeof(IPluginExecutionContext)))
                .Returns(context);

            return serviceProvider;
        }
    }
}