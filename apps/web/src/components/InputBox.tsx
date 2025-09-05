interface InputBoxPropsInterface {
    title: string,
    maxLength: number,
    id?: string,
    required? : boolean,
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
    name?: string,
    height?: number,
    type?: string,
    defaultValue?: string
}

export default function InputBox({
    title,
    maxLength,
    id,
    onChange,
    required,
    onKeyDown,
    name,
    height,
    type,
    defaultValue
}: InputBoxPropsInterface){
    return (
        <input id={id} autoComplete="off" placeholder={title} required={required ? true : false}
        className={`w-full ${height ? `h-${height}` : "h-10"} p-2 text-base border-1 border-gray-500 rounded-md`}
        maxLength={maxLength} onChange={onChange} onKeyDown={onKeyDown} name={name} type={type} defaultValue={defaultValue} />
    )
}