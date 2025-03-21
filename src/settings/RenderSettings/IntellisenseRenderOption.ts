/**
 * The recongized render setting options
 */
export enum IntellisenseRenderOption {
    Off = 0,
    RenderDescriptionParameterReturn = 1,
    RenderDescriptionParameterList = 2,
    RenderDescriptionReturn = 3,
    RenderDescriptionOnly = 4
}

/**
 * 
 * @param value The intellisense render setting
 * @returns True if the Return Intellisense should render, otherwise false
 */
export function shouldRenderReturns(render_setting: IntellisenseRenderOption | boolean) : boolean {
    // Render override
    if (isBoolean(render_setting)) return render_setting

    return [
        IntellisenseRenderOption.RenderDescriptionParameterReturn,
        IntellisenseRenderOption.RenderDescriptionReturn
    ].includes(render_setting)
}

/**
 * 
 * @param value The intellisense render setting
 * @returns True if the Parameters Intellisense should render, otherwise false
 */
export function shouldRenderParameters(render_setting: IntellisenseRenderOption) : boolean {
    // Render override
    if (isBoolean(render_setting)) return render_setting

    return [
        IntellisenseRenderOption.RenderDescriptionParameterReturn,
        IntellisenseRenderOption.RenderDescriptionParameterList
    ].includes(render_setting);
}

/**
 * 
 * @param value The intellisense render setting
 * @returns True if the Description Intellisense should render, otherwise false
 */
export function shouldRenderDescription(render_setting: IntellisenseRenderOption) : boolean {
    // Render override
    if (isBoolean(render_setting)) return render_setting

    return render_setting != IntellisenseRenderOption.Off
}
