export function Header() {
    return (
        <box flexDirection="column" alignItems="center" gap={0}> 
                <box width={50} alignItems="center" justifyContent="center">
                    <ascii-font font="block" text="filiks" color={["#ffefef", "#10a2db"]} />
                </box>
                <box width={43} alignItems="center" justifyContent="center">
                    <text fg="#ffffff">Built different, from Malawi to the world.</text>
                </box>
            </box>
    );
}