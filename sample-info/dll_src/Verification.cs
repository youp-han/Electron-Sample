using System.Diagnostics;
using System.Threading.Tasks;

namespace Verification
{
    public class Startup
    {
        Process[] runProcess()
        {
            Process[] processList = Process.GetProcesses();
            return processList;
        }

        public async Task<object> Invoke(dynamic input)
        {
            return checkProcess();
        }

        bool checkProcess()
        {
            bool result = false;
            Process[] processList = runProcess();
            string[] processName = { "WwcNT" };

            foreach (var listItem in processList)
            {
                foreach (var process in processName)
                {
                    if (listItem.ToString().Contains(process))
                    {
                        result = true;
                    }
                }
            }

            return result;
        }
    }
}
