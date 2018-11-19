"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webview_handler_1 = require("./webview-handler");
const util_1 = require("../util");
const renderer_1 = require("../renderer");
const fs_1 = require("fs");
const macros_util_1 = require("../macros-util");
async function saveAsPDF(text, filePath, grammar, renderLaTeX, saveFilePath) {
    const view = new webview_handler_1.WebviewHandler('pdf', async () => {
        const opts = util_1.atomConfig().saveConfig.saveToPDFOptions;
        const pageSize = opts.pageSize === 'Custom'
            ? parsePageSize(opts.customPageSize)
            : opts.pageSize;
        if (pageSize === undefined) {
            throw new Error(`Failed to parse custom page size: ${opts.customPageSize}`);
        }
        const selection = await view.getSelection();
        const printSelectionOnly = selection ? opts.printSelectionOnly : false;
        const newOpts = Object.assign({}, opts, { pageSize,
            printSelectionOnly });
        const [width, height] = getPageWidth(newOpts.pageSize);
        const mathConfig = util_1.atomConfig().mathConfig;
        const pdfRenderer = util_1.atomConfig().saveConfig.saveToPDFOptions.latexRenderer;
        const renderer = pdfRenderer === 'Same as live preview'
            ? mathConfig.latexRenderer
            : pdfRenderer;
        view.init({
            userMacros: macros_util_1.loadUserMacros(),
            mathJaxConfig: Object.assign({}, mathConfig, { latexRenderer: renderer }),
            context: 'pdf-export',
            pdfExportOptions: { width: newOpts.landscape ? height : width },
        });
        view.setBasePath(filePath);
        const domDocument = await renderer_1.render({
            text,
            filePath,
            grammar,
            renderLaTeX,
            mode: 'normal',
        });
        await view.update(domDocument.documentElement.outerHTML, renderLaTeX);
        try {
            const data = await view.printToPDF(newOpts);
            await new Promise((resolve, reject) => {
                fs_1.writeFile(saveFilePath, data, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        }
        catch (e) {
            const error = e;
            atom.notifications.addError('Failed saving to PDF', {
                description: error.toString(),
                dismissable: true,
                stack: error.stack,
            });
        }
        view.destroy();
    });
    view.element.style.pointerEvents = 'none';
    view.element.style.position = 'absolute';
    view.element.style.width = '0px';
    view.element.style.height = '0px';
    const ws = atom.views.getView(atom.workspace);
    ws.appendChild(view.element);
}
exports.saveAsPDF = saveAsPDF;
function parsePageSize(size) {
    if (!size)
        return undefined;
    const rx = /^([\d.,]+)(cm|mm|in)?x([\d.,]+)(cm|mm|in)?$/i;
    const res = size.replace(/\s*/g, '').match(rx);
    if (res) {
        const width = parseFloat(res[1]);
        const wunit = res[2];
        const height = parseFloat(res[3]);
        const hunit = res[4];
        return {
            width: convert(width, wunit),
            height: convert(height, hunit),
        };
    }
    else {
        return undefined;
    }
}
function convert(val, unit) {
    return val * unitInMicrons(unit);
}
function unitInMicrons(unit = 'mm') {
    switch (unit) {
        case 'mm':
            return 1000;
        case 'cm':
            return 10000;
        case 'in':
            return 25400;
    }
}
function getPageWidth(pageSize) {
    switch (pageSize) {
        case 'A3':
            return [297, 420];
        case 'A4':
            return [210, 297];
        case 'A5':
            return [148, 210];
        case 'Legal':
            return [216, 356];
        case 'Letter':
            return [216, 279];
        case 'Tabloid':
            return [279, 432];
        default:
            return [pageSize.width / 1000, pageSize.height / 1000];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLWV4cG9ydC11dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9wZGYtZXhwb3J0LXV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBa0Q7QUFDbEQsa0NBQW9DO0FBQ3BDLDBDQUFvQztBQUNwQywyQkFBOEI7QUFFOUIsZ0RBQStDO0FBRXhDLEtBQUssVUFBVSxTQUFTLENBQzdCLElBQVksRUFDWixRQUE0QixFQUM1QixPQUE0QixFQUM1QixXQUFvQixFQUNwQixZQUFvQjtJQUVwQixNQUFNLElBQUksR0FBRyxJQUFJLGdDQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ2hELE1BQU0sSUFBSSxHQUFHLGlCQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUE7UUFDckQsTUFBTSxRQUFRLEdBQ1osSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRO1lBQ3hCLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNwQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUNuQixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FDYixxQ0FBcUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUMzRCxDQUFBO1NBQ0Y7UUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtRQUMzQyxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7UUFDdEUsTUFBTSxPQUFPLHFCQUNSLElBQUksSUFDUCxRQUFRO1lBQ1Isa0JBQWtCLEdBQ25CLENBQUE7UUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxD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bkIsS0FBSyxPQUFPO1lBQ1YsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNuQixLQUFLLFFBQVE7WUFDWCxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLEtBQUssU0FBUztZQUNaLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbkI7WUFDRSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUN6RDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBXZWJ2aWV3SGFuZGxlciB9IGZyb20gJy4vd2Vidmlldy1oYW5kbGVyJ1xuaW1wb3J0IHsgYXRvbUNvbmZpZyB9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tICcuLi9yZW5kZXJlcidcbmltcG9ydCB7IHdyaXRlRmlsZSB9IGZyb20gJ2ZzJ1xuaW1wb3J0IHsgQ29uZmlnVmFsdWVzLCBHcmFtbWFyIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGxvYWRVc2VyTWFjcm9zIH0gZnJvbSAnLi4vbWFjcm9zLXV0aWwnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlQXNQREYoXG4gIHRleHQ6IHN0cmluZyxcbiAgZmlsZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgZ3JhbW1hcjogR3JhbW1hciB8IHVuZGVmaW5lZCxcbiAgcmVuZGVyTGFUZVg6IGJvb2xlYW4sXG4gIHNhdmVGaWxlUGF0aDogc3RyaW5nLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHZpZXcgPSBuZXcgV2Vidmlld0hhbmRsZXIoJ3BkZicsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBvcHRzID0gYXRvbUNvbmZpZygpLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9uc1xuICAgIGNvbnN0IHBhZ2VTaXplID1cbiAgICAgIG9wdHMucGFnZVNpemUgPT09ICdDdXN0b20nXG4gICAgICAgID8gcGFyc2VQYWdlU2l6ZShvcHRzLmN1c3RvbVBhZ2VTaXplKVxuICAgICAgICA6IG9wdHMucGFnZVNpemVcbiAgICBpZiAocGFnZVNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRmFpbGVkIHRvIHBhcnNlIGN1c3RvbSBwYWdlIHNpemU6ICR7b3B0cy5jdXN0b21QYWdlU2l6ZX1gLFxuICAgICAgKVxuICAgIH1cbiAgICBjb25zdCBzZWxlY3Rpb24gPSBhd2FpdCB2aWV3LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3QgcHJpbnRTZWxlY3Rpb25Pbmx5ID0gc2VsZWN0aW9uID8gb3B0cy5wcmludFNlbGVjdGlvbk9ubHkgOiBmYWxzZVxuICAgIGNvbnN0IG5ld09wdHMgPSB7XG4gICAgICAuLi5vcHRzLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBwcmludFNlbGVjdGlvbk9ubHksXG4gICAgfVxuICAgIGNvbnN0IFt3aWR0aCwgaGVpZ2h0XSA9IGdldFBhZ2VXaWR0aChuZXdPcHRzLnBhZ2VTaXplKVxuXG4gICAgY29uc3QgbWF0aENvbmZpZyA9IGF0b21Db25maWcoKS5tYXRoQ29uZmlnXG4gICAgY29uc3QgcGRmUmVuZGVyZXIgPSBhdG9tQ29uZmlnKCkuc2F2ZUNvbmZpZy5zYXZlVG9QREZPcHRpb25zLmxhdGV4UmVuZGVyZXJcbiAgICBjb25zdCByZW5kZXJlciA9XG4gICAgICBwZGZSZW5kZXJlciA9PT0gJ1NhbWUgYXMgbGl2ZSBwcmV2aWV3J1xuICAgICAgICA/IG1hdGhDb25maWcubGF0ZXhSZW5kZXJlclxuICAgICAgICA6IHBkZlJlbmRlcmVyXG5cbiAgICB2aWV3LmluaXQoe1xuICAgICAgdXNlck1hY3JvczogbG9hZFVzZXJNYWNyb3MoKSxcbiAgICAgIG1hdGhKYXhDb25maWc6IHtcbiAgICAgICAgLi4ubWF0aENvbmZpZyxcbiAgICAgICAgbGF0ZXhSZW5kZXJlcjogcmVuZGVyZXIsXG4gICAgICB9LFxuICAgICAgY29udGV4dDogJ3BkZi1leHBvcnQnLFxuICAgICAgcGRmRXhwb3J0T3B0aW9uczogeyB3aWR0aDogbmV3T3B0cy5sYW5kc2NhcGUgPyBoZWlnaHQgOiB3aWR0aCB9LFxuICAgIH0pXG4gICAgdmlldy5zZXRCYXNlUGF0aChmaWxlUGF0aClcblxuICAgIGNvbnN0IGRvbURvY3VtZW50ID0gYXdhaXQgcmVuZGVyKHtcbiAgICAgIHRleHQsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGdyYW1tYXIsXG4gICAgICByZW5kZXJMYVRlWCxcbiAgICAgIG1vZGU6ICdub3JtYWwnLFxuICAgIH0pXG4gICAgYXdhaXQgdmlldy51cGRhdGUoZG9tRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IS5vdXRlckhUTUwsIHJlbmRlckxhVGVYKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB2aWV3LnByaW50VG9QREYobmV3T3B0cylcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB3cml0ZUZpbGUoc2F2ZUZpbGVQYXRoLCBkYXRhLCAoZXJyb3IpID0+IHtcbiAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc3QgZXJyb3IgPSBlIGFzIEVycm9yXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0ZhaWxlZCBzYXZpbmcgdG8gUERGJywge1xuICAgICAgICBkZXNjcmlwdGlvbjogZXJyb3IudG9TdHJpbmcoKSxcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdmlldy5kZXN0cm95KClcbiAgfSlcbiAgdmlldy5lbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSdcbiAgdmlldy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICB2aWV3LmVsZW1lbnQuc3R5bGUud2lkdGggPSAnMHB4J1xuICB2aWV3LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzBweCdcbiAgY29uc3Qgd3MgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gIHdzLmFwcGVuZENoaWxkKHZpZXcuZWxlbWVudClcbn1cblxudHlwZSBVbml0ID0gJ21tJyB8ICdjbScgfCAnaW4nXG5cbmZ1bmN0aW9uIHBhcnNlUGFnZVNpemUoc2l6ZTogc3RyaW5nKSB7XG4gIGlmICghc2l6ZSkgcmV0dXJuIHVuZGVmaW5lZFxuICBjb25zdCByeCA9IC9eKFtcXGQuLF0rKShjbXxtbXxpbik/eChbXFxkLixdKykoY218bW18aW4pPyQvaVxuICBjb25zdCByZXMgPSBzaXplLnJlcGxhY2UoL1xccyovZywgJycpLm1hdGNoKHJ4KVxuICBpZiAocmVzKSB7XG4gICAgY29uc3Qgd2lkdGggPSBwYXJzZUZsb2F0KHJlc1sxXSlcbiAgICBjb25zdCB3dW5pdCA9IHJlc1syXSBhcyBVbml0IHwgdW5kZWZpbmVkXG4gICAgY29uc3QgaGVpZ2h0ID0gcGFyc2VGbG9hdChyZXNbM10pXG4gICAgY29uc3QgaHVuaXQgPSByZXNbNF0gYXMgVW5pdCB8IHVuZGVmaW5lZFxuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogY29udmVydCh3aWR0aCwgd3VuaXQpLFxuICAgICAgaGVpZ2h0OiBjb252ZXJ0KGhlaWdodCwgaHVuaXQpLFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxudHlwZSBQYWdlU2l6ZSA9XG4gIHwgRXhjbHVkZTxcbiAgICAgIENvbmZpZ1ZhbHVlc1snbWFya2Rvd24tcHJldmlldy1wbHVzLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9ucy5wYWdlU2l6ZSddLFxuICAgICAgJ0N1c3RvbSdcbiAgICA+XG4gIHwgeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9XG5cbmZ1bmN0aW9uIGNvbnZlcnQodmFsOiBudW1iZXIsIHVuaXQ/OiBVbml0KSB7XG4gIHJldHVybiB2YWwgKiB1bml0SW5NaWNyb25zKHVuaXQpXG59XG5cbmZ1bmN0aW9uIHVuaXRJbk1pY3JvbnModW5pdDogVW5pdCA9ICdtbScpIHtcbiAgc3dpdGNoICh1bml0KSB7XG4gICAgY2FzZSAnbW0nOlxuICAgICAgcmV0dXJuIDEwMDBcbiAgICBjYXNlICdjbSc6XG4gICAgICByZXR1cm4gMTAwMDBcbiAgICBjYXNlICdpbic6XG4gICAgICByZXR1cm4gMjU0MDBcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQYWdlV2lkdGgocGFnZVNpemU6IFBhZ2VTaXplKSB7XG4gIHN3aXRjaCAocGFnZVNpemUpIHtcbiAgICBjYXNlICdBMyc6XG4gICAgICByZXR1cm4gWzI5NywgNDIwXVxuICAgIGNhc2UgJ0E0JzpcbiAgICAgIHJldHVybiBbMjEwLCAyOTddXG4gICAgY2FzZSAnQTUnOlxuICAgICAgcmV0dXJuIFsxNDgsIDIxMF1cbiAgICBjYXNlICdMZWdhbCc6XG4gICAgICByZXR1cm4gWzIxNiwgMzU2XVxuICAgIGNhc2UgJ0xldHRlcic6XG4gICAgICByZXR1cm4gWzIxNiwgMjc5XVxuICAgIGNhc2UgJ1RhYmxvaWQnOlxuICAgICAgcmV0dXJuIFsyNzksIDQzMl1cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFtwYWdlU2l6ZS53aWR0aCAvIDEwMDAsIHBhZ2VTaXplLmhlaWdodCAvIDEwMDBdXG4gIH1cbn1cbiJdfQ==