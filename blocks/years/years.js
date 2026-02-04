export default function decorate(block) {
  const items = [...block.children].map((row) =>
    row.textContent.trim()
  );

  block.innerHTML = "";

  if (!items.length) {
    block.innerHTML = "<p>No years available.</p>";
    return;
  }

  const container = document.createElement("div");
  container.className = "years";

  const list = document.createElement("ul");
  list.className = "years-list";

  items.forEach((year) => {
    const li = document.createElement("li");
    li.className = "year-item";
    li.textContent = year;
    li.setAttribute("data-year", year);

    list.appendChild(li);
  });

  container.appendChild(list);
  block.appendChild(container);
}
